import Link from "next/link";
import ProductSection from "./components/ProductSection";
import FeatureSection from "@/app/components/sections/FeatureSection";
import ServerProductList from "./components/ServerProductList";
import Footer from "@/app/components/common/Footer";
import FAQ from "@/app/components/common/FAQ";
import { fetcherProductsServer } from "@/app/api/products/fetcherProductsServer";
import { InfoProps } from "@/app/types/types";
import { ProductType } from "@/app/types/Product";
import ReviewsSection from "./components/ReviewsSection";
import FacebookPixelTracker from "./components/FacebookPixelTracker";
import { notFound } from "next/navigation";

const info: InfoProps[] = [
  {
    title: "Os produtos são originais e importados?",
    description: "Sim! Todos os nossos produtos são 100% originais e importados diretamente dos Estados Unidos. Trabalhamos apenas com marcas renomadas como Victoria's Secret, Sheglam e Kiko Milano, garantindo autenticidade e qualidade em cada item."
  },
  {
    title: "Como saber se o Body Splash tem shimmer?",
    description: "Os Body Splashes com shimmer da Victoria's Secret possuem partículas brilhantes que deixam a pele com um brilho sutil e elegante. Você pode identificar pelos nomes que incluem 'Shimmer' como Coconut Passion Shimmer, Aqua Kiss Shimmer e Pure Seduction Shimmer."
  },
  {
    title: "O Iluminador Sheglam é adequado para todos os tipos de pele?",
    description: "Sim! O Iluminador Sheglam possui fórmula universal que se adapta a diferentes tons de pele. Sua textura cremosa e buildable permite criar desde um glow natural até um brilho mais intenso, sendo perfeito para peles secas, mistas e oleosas."
  },
  {
    title: "O Gloss Kiko Milano resseca os lábios?",
    description: "Não! O Gloss Kiko Milano possui fórmula hidratante que nutre os lábios enquanto proporciona brilho e cor. Sua textura cremosa mantém os lábios macios e hidratados por horas, sem causar ressecamento."
  },
  {
    title: "Qual a durabilidade dos Body Splashes Victoria's Secret?",
    description: "Os Body Splashes Victoria's Secret têm excelente fixação, permanecendo na pele por 4-6 horas em média. As fragrâncias são intensas e marcantes, especialmente as versões Coconut Passion, Aqua Kiss, Bare Vanilla e Pure Seduction."
  },
  {
    title: "Como aplicar o iluminador para um resultado natural?",
    description: "Para um glow natural, aplique o Iluminador Sheglam nos pontos altos do rosto: maçãs do rosto, têmporas, ponte do nariz e arco do cupido. Use os dedos ou pincel para esfumar suavemente. Para intensificar, aplique em camadas."
  },
  {
    title: "Os produtos têm garantia de qualidade?",
    description: "Absolutamente! Oferecemos garantia total de qualidade em todos os produtos. Se você não ficar satisfeito com sua compra, entre em contato conosco. Nosso compromisso é sua satisfação com produtos originais e de alta qualidade."
  }
];

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const ProductDetailPage = async ({ params }: ProductDetailPageProps) => {
  const { id: productId } = await params;

  let products;
  try {
    // Fetch products directly on the server using server-side function
    products = await fetcherProductsServer({ limit: 200, shuffle: 0, offset: 0 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Erro ao carregar produtos</h1>
        <Link href="/" className="text-red-600 hover:underline">
          Voltar para a home
        </Link>
      </div>
    );
  }

  const product = products?.list?.find(
    (p: ProductType) => p.Id.toString() === productId
  );

  if (!product) {
    notFound();
  }

  return (
    <div className="grid align-center justify-between pt-24 bg-white">
      <FacebookPixelTracker product={product} />
      <ProductSection product={product} />
      {product.reviews?.length > 0 && <ReviewsSection product={product} />}
      <ServerProductList  maxColumns={4} maxProducts={20} title="Você também vai A-M-A-R" />
      <div className="lg:px-16">
        <FeatureSection
          title="Beleza Importada dos EUA"
          description="Descubra a qualidade excepcional dos cosméticos americanos! Nossos produtos Victoria's Secret, Sheglam e Kiko Milano são importados diretamente dos Estados Unidos, garantindo autenticidade e as últimas tendências em beleza internacional. Experimente o que há de melhor no mundo da cosmética!"
          bannerUrl="/17-20250828.webp"
          button={false}
          bgColor="#F9EEEF"
          textColor="#E7002A"
        />
        <FeatureSection
          title="Qualidade Premium Garantida"
          description="Cada produto passa por rigoroso controle de qualidade. Trabalhamos apenas com fornecedores oficiais nos EUA para garantir que você receba produtos 100% originais, com fórmulas exclusivas e resultados profissionais em casa."
          inverter={false}
          bannerUrl="/top-10-best-victoria-secret-perfume-header.jpg"
          button={false}
          bgColor="#eed2ee"
          textColor="#4B0082"
        />
      </div>
      <FAQ title="Perguntas Frequentes" info={info} />
      <Footer />
    </div>
  );
};

export default ProductDetailPage;