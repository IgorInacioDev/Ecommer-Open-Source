/**
 * Facebook Pixel Events System
 * Complete implementation of all standard Facebook events with optimized parameters
 */

import {
  StandardEvent,
  EventParameters,
  ViewContentParameters,
  SearchParameters,
  AddToCartParameters,
  AddToWishlistParameters,
  InitiateCheckoutParameters,
  AddPaymentInfoParameters,
  PurchaseParameters,
  LeadParameters,
  CompleteRegistrationParameters,
  PageViewParameters,
  Product,
  CartItem,
  Order,
  EnhancedMatchingData,
  BaseEventParameters,
} from '../../types/facebook-pixel';

// Define missing parameter interfaces locally
export interface ContactParameters extends BaseEventParameters {
  content_category?: string;
}

export interface CustomizeProductParameters extends BaseEventParameters {
  content_ids: string[];
  content_type: 'product' | 'product_group';
  value?: number;
  currency?: string;
}

export interface DonateParameters extends BaseEventParameters {
  value: number;
  currency: string;
}

export interface FindLocationParameters extends BaseEventParameters {
  content_category?: string;
}

export interface ScheduleParameters extends BaseEventParameters {
  content_category?: string;
}

export interface StartTrialParameters extends BaseEventParameters {
  content_name?: string;
  value?: number;
  currency?: string;
}

export interface SubmitApplicationParameters extends BaseEventParameters {
  content_category?: string;
}

export interface SubscribeParameters extends BaseEventParameters {
  value?: number;
  currency?: string;
}

export interface AdImpressionParameters extends BaseEventParameters {
  content_ids?: string[];
}

export interface AdClickParameters extends BaseEventParameters {
  content_ids?: string[];
}
import { trackEvent } from './pixel';
import { normalizeCurrency, getDeviceType, autoCollectEnhancedMatching } from './utils';
import { validateEventParameters } from './validation';

/**
 * Auto-collect common parameters for all events
 */
const getCommonParameters = async (): Promise<Partial<EventParameters>> => {
  const deviceType = getDeviceType();
  const commonParams: Partial<EventParameters> = {};

  // Add device information
  if (typeof window !== 'undefined') {
    commonParams.custom_data = {
      ...commonParams.custom_data,
      device_type: deviceType,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
    };
  }

  // Add UTM parameters if available
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
      const value = urlParams.get(param);
      if (value) {
        utmParams[param] = value;
      }
    });

    if (Object.keys(utmParams).length > 0) {
      commonParams.custom_data = {
        ...commonParams.custom_data,
        ...utmParams,
      };
    }

    // Add referrer information
    if (document.referrer) {
      commonParams.custom_data = {
        ...commonParams.custom_data,
        referrer: document.referrer,
      };
    }
  }

  return commonParams;
};

/**
 * Convert product to content format
 */
const productToContent = (product: Product, quantity: number = 1) => {
  return {
    id: product.id,
    quantity: quantity,
    item_price: product.price,
    title: product.name,
    description: product.description,
    category: product.category,
    brand: product.brand,
  };
};

/**
 * Convert cart items to contents array
 */
const cartToContents = (items: CartItem[]) => {
  return items.map(item => ({
    id: item.id,
    quantity: item.quantity,
    item_price: item.price,
    title: item.name,
    category: item.category,
    brand: item.brand,
  }));
};

/**
 * Calculate total value from cart items
 */
const calculateCartValue = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

/**
 * PAGE VIEW EVENT
 * Track page views with enhanced data
 */
export const trackPageView = async (parameters?: PageViewParameters): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const pageViewParams: PageViewParameters = {
    ...commonParams,
    ...parameters,
  };

  // Add page-specific data
  if (typeof window !== 'undefined') {
    pageViewParams.custom_data = {
      ...pageViewParams.custom_data,
      page_title: document.title,
      page_url: window.location.href,
      page_path: window.location.pathname,
    };
  }

  return trackEvent('PageView', pageViewParams);
};

/**
 * VIEW CONTENT EVENT
 * Track when users view products or content
 */
export const trackViewContent = async (
  product: Product,
  parameters?: Partial<ViewContentParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const viewContentParams: ViewContentParameters = {
    content_ids: [product.id],
    content_type: 'product',
    content_name: product.name,
    content_category: product.category,
    value: product.price,
    currency: normalizeCurrency(product.currency || 'BRL'),
    contents: [productToContent(product, 1)],
    ...commonParams,
    ...parameters,
  };

  // Add product-specific data
  viewContentParams.custom_data = {
    ...viewContentParams.custom_data,
    product_brand: product.brand,
    product_availability: product.availability,
    product_condition: product.condition,
  };

  return trackEvent('ViewContent', viewContentParams);
};

/**
 * SEARCH EVENT
 * Track search queries and results
 */
export const trackSearch = async (
  searchQuery: string,
  results?: Product[],
  parameters?: Partial<SearchParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const searchParams: SearchParameters = {
    search_string: searchQuery,
    content_category: parameters?.content_category,
    content_ids: results?.map(p => p.id),
    ...commonParams,
    ...parameters,
  };

  // Add search-specific data
  searchParams.custom_data = {
    ...searchParams.custom_data,
    search_results_count: results?.length || 0,
    search_filters: parameters?.custom_data?.search_filters,
    search_sort: parameters?.custom_data?.search_sort,
  };

  return trackEvent('Search', searchParams);
};

/**
 * ADD TO CART EVENT
 * Track when users add products to cart
 */
export const trackAddToCart = async (
  product: Product,
  quantity: number = 1,
  parameters?: Partial<AddToCartParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  const totalValue = product.price * quantity;
  
  const addToCartParams: AddToCartParameters = {
    content_ids: [product.id],
    content_type: 'product',
    content_name: product.name,
    content_category: product.category,
    value: totalValue,
    currency: normalizeCurrency(product.currency || 'BRL'),
    num_items: quantity,
    contents: [productToContent(product, quantity)],
    ...commonParams,
    ...parameters,
  };

  // Add cart-specific data
  addToCartParams.custom_data = {
    ...addToCartParams.custom_data,
    product_brand: product.brand,
    cart_action: 'add',
    quantity_added: quantity,
  };

  return trackEvent('AddToCart', addToCartParams);
};

/**
 * ADD TO WISHLIST EVENT
 * Track when users add products to wishlist
 */
export const trackAddToWishlist = async (
  product: Product,
  parameters?: Partial<AddToWishlistParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const addToWishlistParams: AddToWishlistParameters = {
    content_ids: [product.id],
    content_type: 'product',
    content_name: product.name,
    content_category: product.category,
    value: product.price,
    currency: normalizeCurrency(product.currency || 'BRL'),
    contents: [productToContent(product, 1)],
    ...commonParams,
    ...parameters,
  };

  // Add wishlist-specific data
  addToWishlistParams.custom_data = {
    ...addToWishlistParams.custom_data,
    product_brand: product.brand,
    wishlist_action: 'add',
  };

  return trackEvent('AddToWishlist', addToWishlistParams);
};

/**
 * INITIATE CHECKOUT EVENT
 * Track when users start the checkout process
 */
export const trackInitiateCheckout = async (
  cartItems: CartItem[],
  parameters?: Partial<InitiateCheckoutParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  const totalValue = calculateCartValue(cartItems);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const initiateCheckoutParams: InitiateCheckoutParameters = {
    content_ids: cartItems.map(item => item.id),
    content_type: 'product',
    value: totalValue,
    currency: normalizeCurrency(cartItems[0]?.currency || 'BRL'),
    num_items: totalItems,
    contents: cartToContents(cartItems),
    ...commonParams,
    ...parameters,
  };

  // Add checkout-specific data
  initiateCheckoutParams.custom_data = {
    ...initiateCheckoutParams.custom_data,
    checkout_step: 1,
    cart_size: cartItems.length,
    unique_products: new Set(cartItems.map(item => item.id)).size,
  };

  return trackEvent('InitiateCheckout', initiateCheckoutParams);
};

/**
 * ADD PAYMENT INFO EVENT
 * Track when users add payment information
 */
export const trackAddPaymentInfo = async (
  cartItems: CartItem[],
  paymentMethod?: string,
  parameters?: Partial<AddPaymentInfoParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  const totalValue = calculateCartValue(cartItems);
  
  const addPaymentInfoParams: AddPaymentInfoParameters = {
    content_ids: cartItems.map(item => item.id),
    content_type: 'product',
    value: totalValue,
    currency: normalizeCurrency(cartItems[0]?.currency || 'BRL'),
    contents: cartToContents(cartItems),
    ...commonParams,
    ...parameters,
  };

  // Add payment-specific data
  addPaymentInfoParams.custom_data = {
    ...addPaymentInfoParams.custom_data,
    payment_method: paymentMethod,
    checkout_step: 2,
  };

  return trackEvent('AddPaymentInfo', addPaymentInfoParams);
};

/**
 * PURCHASE EVENT
 * Track completed purchases - most important for conversion tracking
 */
export const trackPurchase = async (
  order: Order,
  parameters?: Partial<PurchaseParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const purchaseParams: PurchaseParameters = {
    content_ids: order.items.map(item => item.id),
    content_type: 'product',
    value: order.total_value,
    currency: normalizeCurrency(order.currency || 'BRL'),
    order_id: order.id,
    num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
    contents: cartToContents(order.items),
    ...commonParams,
    ...parameters,
  };

  // Add purchase-specific data
  purchaseParams.custom_data = {
    ...purchaseParams.custom_data,
    order_id: order.id,
    payment_method: order.payment_method,
    shipping_method: order.shipping_method,
    shipping_cost: order.shipping_cost,
    tax_amount: order.tax_amount,
    discount_amount: order.discount_amount,
  };

  return trackEvent('Purchase', purchaseParams);
};

/**
 * LEAD EVENT
 * Track lead generation events
 */
export const trackLead = async (
  leadType?: string,
  value?: number,
  parameters?: Partial<LeadParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const leadParams: LeadParameters = {
    content_name: leadType,
    value: value,
    currency: value ? normalizeCurrency('BRL') : undefined,
    ...commonParams,
    ...parameters,
  };

  // Add lead-specific data
  leadParams.custom_data = {
    ...leadParams.custom_data,
    lead_type: leadType,
    lead_source: parameters?.custom_data?.lead_source,
    form_name: parameters?.custom_data?.form_name,
  };

  return trackEvent('Lead', leadParams);
};

/**
 * COMPLETE REGISTRATION EVENT
 * Track user registrations
 */
export const trackCompleteRegistration = async (
  registrationType?: string,
  parameters?: Partial<CompleteRegistrationParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const registrationParams: CompleteRegistrationParameters = {
    content_name: registrationType || 'registration',
    status: 'completed',
    ...commonParams,
    ...parameters,
  };

  // Add registration-specific data
  registrationParams.custom_data = {
    ...registrationParams.custom_data,
    registration_type: registrationType,
    registration_method: parameters?.custom_data?.registration_method,
  };

  return trackEvent('CompleteRegistration', registrationParams);
};

/**
 * CONTACT EVENT
 * Track contact form submissions or contact attempts
 */
export const trackContact = async (
  contactMethod?: string,
  parameters?: Partial<ContactParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const contactParams: ContactParameters = {
    content_category: contactMethod || 'contact',
    ...commonParams,
    ...parameters,
  };

  // Add contact-specific data
  contactParams.custom_data = {
    ...contactParams.custom_data,
    contact_method: contactMethod,
    contact_reason: parameters?.custom_data?.contact_reason,
  };

  return trackEvent('Contact', contactParams);
};

/**
 * CUSTOMIZE PRODUCT EVENT
 * Track product customization events
 */
export const trackCustomizeProduct = async (
  product: Product,
  customizations?: Record<string, unknown>,
  parameters?: Partial<CustomizeProductParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const customizeParams: CustomizeProductParameters = {
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: normalizeCurrency(product.currency || 'BRL'),
    ...commonParams,
    ...parameters,
  };

  // Add customization-specific data
  customizeParams.custom_data = {
    ...customizeParams.custom_data,
    product_id: product.id,
    customizations: customizations,
  };

  return trackEvent('CustomizeProduct', customizeParams);
};

/**
 * DONATE EVENT
 * Track donation events
 */
export const trackDonate = async (
  amount: number,
  currency: string = 'BRL',
  parameters?: Partial<DonateParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const donateParams: DonateParameters = {
    value: amount,
    currency: normalizeCurrency(currency),
    ...commonParams,
    ...parameters,
  };

  return trackEvent('Donate', donateParams);
};

/**
 * FIND LOCATION EVENT
 * Track location search events
 */
export const trackFindLocation = async (
  locationType?: string,
  parameters?: Partial<FindLocationParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const findLocationParams: FindLocationParameters = {
    content_category: locationType || 'location',
    ...commonParams,
    ...parameters,
  };

  return trackEvent('FindLocation', findLocationParams);
};

/**
 * SCHEDULE EVENT
 * Track appointment or event scheduling
 */
export const trackSchedule = async (
  eventType?: string,
  parameters?: Partial<ScheduleParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const scheduleParams: ScheduleParameters = {
    content_category: eventType || 'appointment',
    ...commonParams,
    ...parameters,
  };

  return trackEvent('Schedule', scheduleParams);
};

/**
 * START TRIAL EVENT
 * Track trial starts
 */
export const trackStartTrial = async (
  trialType?: string,
  value?: number,
  parameters?: Partial<StartTrialParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const startTrialParams: StartTrialParameters = {
    content_name: trialType,
    value: value,
    currency: value ? normalizeCurrency('BRL') : undefined,
    ...commonParams,
    ...parameters,
  };

  return trackEvent('StartTrial', startTrialParams);
};

/**
 * SUBMIT APPLICATION EVENT
 * Track application submissions
 */
export const trackSubmitApplication = async (
  applicationType?: string,
  parameters?: Partial<SubmitApplicationParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const submitApplicationParams: SubmitApplicationParameters = {
    content_category: applicationType || 'application',
    ...commonParams,
    ...parameters,
  };

  return trackEvent('SubmitApplication', submitApplicationParams);
};

/**
 * SUBSCRIBE EVENT
 * Track subscription events
 */
export const trackSubscribe = async (
  subscriptionType?: string,
  value?: number,
  parameters?: Partial<SubscribeParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const subscribeParams: SubscribeParameters = {
    value: value,
    currency: value ? normalizeCurrency('BRL') : undefined,
    ...commonParams,
    ...parameters,
  };

  // Add subscription-specific data
  subscribeParams.custom_data = {
    ...subscribeParams.custom_data,
    subscription_type: subscriptionType,
  };

  return trackEvent('Subscribe', subscribeParams);
};

/**
 * AD IMPRESSION EVENT
 * Track ad impressions
 */
export const trackAdImpression = async (
  adIds?: string[],
  parameters?: Partial<AdImpressionParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const adImpressionParams: AdImpressionParameters = {
    content_ids: adIds,
    ...commonParams,
    ...parameters,
  };

  return trackEvent('AdImpression', adImpressionParams);
};

/**
 * AD CLICK EVENT
 * Track ad clicks
 */
export const trackAdClick = async (
  adIds?: string[],
  parameters?: Partial<AdClickParameters>
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const adClickParams: AdClickParameters = {
    content_ids: adIds,
    ...commonParams,
    ...parameters,
  };

  return trackEvent('AdClick', adClickParams);
};

/**
 * CUSTOM EVENT
 * Track custom events with validation
 */
export const trackCustomEvent = async (
  eventName: string,
  parameters?: EventParameters,
  enhancedMatching?: EnhancedMatchingData
): Promise<void> => {
  const commonParams = await getCommonParameters();
  
  const customParams: EventParameters = {
    ...commonParams,
    ...parameters,
  };

  return trackEvent(eventName, customParams, enhancedMatching);
};

/**
 * BATCH EVENTS
 * Track multiple events in sequence with delay
 */
export const trackBatchEvents = async (
  events: Array<{
    eventName: StandardEvent | string;
    parameters?: EventParameters;
    enhancedMatching?: EnhancedMatchingData;
    delay?: number;
  }>
): Promise<void> => {
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    
    try {
      await trackEvent(event.eventName, event.parameters, event.enhancedMatching);
      
      // Add delay between events if specified
      if (event.delay && i < events.length - 1) {
        await new Promise(resolve => setTimeout(resolve, event.delay));
      }
    } catch (error) {
      console.error(`Failed to track batch event ${event.eventName}:`, error);
    }
  }
};

/**
 * E-COMMERCE FUNNEL TRACKING
 * Track complete e-commerce funnel with automatic event sequencing
 */
export const trackEcommerceFunnel = {
  /**
   * Track product view and related events
   */
  productView: async (product: Product, source?: string) => {
    const events = [
      {
        eventName: 'ViewContent' as StandardEvent,
        parameters: {
          content_ids: [product.id],
          content_type: 'product' as const,
          content_name: product.name,
          content_category: product.category,
          value: product.price,
          currency: normalizeCurrency(product.currency || 'BRL'),
          custom_data: { view_source: source },
        } as ViewContentParameters,
      },
    ];

    return trackBatchEvents(events);
  },

  /**
   * Track add to cart and related events
   */
  addToCart: async (product: Product, quantity: number = 1) => {
    const events = [
      {
        eventName: 'AddToCart' as StandardEvent,
        parameters: {
          content_ids: [product.id],
          content_type: 'product' as const,
          content_name: product.name,
          content_category: product.category,
          value: product.price * quantity,
          currency: normalizeCurrency(product.currency || 'BRL'),
          num_items: quantity,
        } as AddToCartParameters,
        delay: 100,
      },
    ];

    return trackBatchEvents(events);
  },

  /**
   * Track checkout funnel
   */
  checkoutFunnel: async (cartItems: CartItem[], step: 'initiate' | 'payment' | 'complete', orderData?: Order) => {
    const events = [];

    if (step === 'initiate') {
      events.push({
        eventName: 'InitiateCheckout' as StandardEvent,
        parameters: {
          content_ids: cartItems.map(item => item.id),
          content_type: 'product' as const,
          value: calculateCartValue(cartItems),
          currency: normalizeCurrency(cartItems[0]?.currency || 'BRL'),
          num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        } as InitiateCheckoutParameters,
      });
    } else if (step === 'payment') {
      events.push({
        eventName: 'AddPaymentInfo' as StandardEvent,
        parameters: {
          content_ids: cartItems.map(item => item.id),
          content_type: 'product' as const,
          value: calculateCartValue(cartItems),
          currency: normalizeCurrency(cartItems[0]?.currency || 'BRL'),
        } as AddPaymentInfoParameters,
      });
    } else if (step === 'complete' && orderData) {
      events.push({
        eventName: 'Purchase' as StandardEvent,
        parameters: {
          content_ids: orderData.items.map(item => item.id),
          content_type: 'product' as const,
          value: orderData.total_value,
          currency: normalizeCurrency(orderData.currency || 'BRL'),
          order_id: orderData.id,
          num_items: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
        } as PurchaseParameters,
      });
    }

    return trackBatchEvents(events);
  },
};

const facebookPixelEvents = {
  trackPageView,
  trackViewContent,
  trackSearch,
  trackAddToCart,
  trackAddToWishlist,
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackLead,
  trackCompleteRegistration,
  trackContact,
  trackCustomizeProduct,
  trackDonate,
  trackFindLocation,
  trackSchedule,
  trackStartTrial,
  trackSubmitApplication,
  trackSubscribe,
  trackAdImpression,
  trackAdClick,
  trackCustomEvent,
  trackBatchEvents,
  trackEcommerceFunnel,
};

export default facebookPixelEvents;