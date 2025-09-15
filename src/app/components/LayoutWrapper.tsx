'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface LayoutWrapperProps {
  children: ReactNode;
  className: string;
}

export default function LayoutWrapper({ children, className }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Remove pt-8 quando estiver na página de checkout
  const isCheckoutPage = pathname === '/checkout';
  const modifiedClassName = isCheckoutPage 
    ? className.replace('pt-8', '') 
    : className;

  return (
    <body className={modifiedClassName}>
      {children}
    </body>
  );
}