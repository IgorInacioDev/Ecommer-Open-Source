import CoreProvider from "@/app/components/core-provider";

import type { Metadata } from "next";
import { Syne, Barlow, Montserrat } from "next/font/google";

import "./globals.css";
import NavBar from "./components/common/NavBar";
import ScrollToTop from "./components/common/ScrollToTop";
import { CartProvider } from "./contexts/CartContext";
import { CheckoutProvider } from "./contexts/CheckoutContext";
import CartModal from "./components/CartModal";
import LayoutWrapper from "./components/LayoutWrapper";
import GlobalAPITracker from "./components/GlobalAPITracker";
import SessionStatusTracker from "./components/SessionStatusTracker";

const geistSyne = Syne({
  variable: "--font-geist-syne",
  subsets: ["latin"],
});

const geistBarlow = Barlow({
  variable: "--font-geist-barlow",
  weight: "400",
  subsets: ["latin"],
});

const geistMontserrat = Montserrat({
  variable: "--font-geist-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lure Secret |Importados e Originais",
  description: "Aplicar protetor solar diariamente pode ser algo descomplicado, fácil, intuitivo e agradável para todos.",
  icons: {
    icon: '/2-lure.png',
    shortcut: '/2-lure.png',
    apple: '/2-lure.png',
  },
  other: {
    'autocomplete': 'off',
    'form-autocomplete': 'off'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '741060048914663');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=741060048914663&ev=PageView&noscript=1"
            alt="Facebook Pixel"
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <LayoutWrapper className={`${geistSyne.variable} ${geistBarlow.variable} ${geistMontserrat.variable} antialiased bg-white pt-8`}>
        <CoreProvider>
          <CheckoutProvider>
            <CartProvider>
              <GlobalAPITracker />
              <SessionStatusTracker />
              <div className="fixed top-0 left-0 right-0 z-50">
                <NavBar />
              </div>
              <ScrollToTop />
              {children}
              <CartModal />
            </CartProvider>
          </CheckoutProvider>
        </CoreProvider>
      </LayoutWrapper>
    </html>
  );
}
