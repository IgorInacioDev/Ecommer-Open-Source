import { ImageType, InfoSection, Order, VideoReview } from "./types";

export type ProductType = {
  Id: string;
  name: string;
  CreatedAt: string;
  UpdatedAt: string;
  reviews: ReviewType[];
  reviewsCount?: number; // Número de avaliações gerado aleatoriamente
  original_price: number;
  sale_price: number | null;
  variations: null | [
    {
      name: string;
      colors: {
        title: string;
        hex: string;
      }[];
      imageUrl: string;
    }
  ]; // TODO: Define colors type when available
  description: string;
  info_sections: InfoSection[];
  orders_id: number;
  Images: ImageType[];
  video_reviews: VideoReview[];
  orders: Order;
}

export type ProductsResponseType = {
  list: ProductType[];
  pageInfo: {
    total: number;
    page: number;
    pageSize: number;
  }
}

export type ReviewType = {
  rating: number;
  reviewerName: string;
  reviewTitle: string;
  reviewText: string;
  skinType: string;
  skinFeatures: string;
  ageRange: string;
  likes: number;
  dislikes: number;
}