'use client'

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Footer from "../components/common/Footer";
import ProductList from "../components/product/ProductList";
import Skeleton from "../components/ui/Skeleton";

const ProductsContent = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('category');
  
  const getTitle = () => {
    if (searchQuery === 'club') {
      return "The Lure Secret";
    } else if (searchQuery === 'kit') {
      return "Kits";
    } else {
      return "70% de desconto apenas esse mês!";
    }
  };

  console.log(searchQuery);

  return (
    <>
      <div className="w-full bg-[#FDF5E6] py-10 flex justify-center items-center">
        <img
          src="/KITS_DESKTOP.webp"
          alt='Lure Secret'
          className="w-3/4"
        />
      </div>
      <div className="">
        <ProductList title={getTitle()} maxColumns={4} />
      </div>
    </>
  );
};

const ProductsPageContent = () => {
  return (
    <Suspense fallback={<div className="space-y-6"><Skeleton className="h-8 w-64" /><div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[...Array(8)].map((_, i) => (<div key={i} className="space-y-3"><Skeleton className="h-64 w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-6 w-20" /></div>))}</div></div>}>
      <ProductsContent />
    </Suspense>
  );
};

const ProductsPage = () => {
  return (
    <div className="min-h-screen pt-16 bg-white">
      <Suspense fallback={<div className="min-h-screen pt-16 bg-white flex items-center justify-center"><Skeleton className="h-8 w-64" /></div>}>
        <ProductsPageContent />
      </Suspense>
      <Footer/>
    </div>
  );
};

export default ProductsPage;