import { Suspense } from "react";
import EvaluationSection from "./components/sections/EvaluationSection";
import ProductList from "./components/product/ProductList";
import FeatureSection from "./components/sections/FeatureSection";
import BlogSection from "./components/sections/BlogSection";
import BannerSection from "./components/sections/BannerSection";
import Footer from "./components/common/Footer";
import Skeleton from "./components/ui/Skeleton";
import Image from "next/image";

const Homepage = () => {
  return (
    <div className="pt-8">
      <BannerSection />
      <div>
        <Suspense fallback={<div className="space-y-6"><Skeleton className="h-8 w-64" /><div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[...Array(5)].map((_, i) => (<div key={i} className="space-y-3"><Skeleton className="h-64 w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-6 w-20" /></div>))}</div></div>}>
          <ProductList maxProducts={10} title="70% de desconto apenas esse mês!" />
        </Suspense>

        <div className="overflow-hidden rounded-lg">
          <picture>
            <source
              media="(max-width: 768px)"
              srcSet="/mobile/banner2.jpg"
            />
            <Image
              src="/banners/banner2.webp"
              width={1920}
              height={300}
              className="w-full p-8 object-left rounded-lg"
              alt="Banner promocional"
            />
          </picture>
        </div>

        <Suspense fallback={<div className="space-y-6"><Skeleton className="h-8 w-64" /><div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[...Array(8)].map((_, i) => (<div key={i} className="space-y-3"><Skeleton className="h-64 w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-6 w-20" /></div>))}</div></div>}>
          <ProductList filterName="kit" maxColumns={4} title="Nossos Kits" showButton={true} />
        </Suspense>
        <FeatureSection
          title="Produtos Originais, importado direto dos EUA."
          description="Garantimos a autenticidade de todos os nossos produtos, trazidos diretamente dos Estados Unidos para você ter a melhor experiência com marcas internacionais."
          bannerUrl="/banners/banner3.png"
        />
        <Suspense fallback={<div className="space-y-6"><Skeleton className="h-8 w-64" /><div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[...Array(8)].map((_, i) => (<div key={i} className="space-y-3"><Skeleton className="h-64 w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-6 w-20" /></div>))}</div></div>}>
          <ProductList title="Todos os Produtos" showButton={true} />
        </Suspense>
        <EvaluationSection />
        <BlogSection />
      </div>
      <Footer />
    </div>
  )
}

export default Homepage