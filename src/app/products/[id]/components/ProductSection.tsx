
import { ProductType } from "@/app/types/Product";
import ProductImages from "./ProductImages";
import ProductInfo from "./ProductInfo";

interface ProductSectionProps {
  product: ProductType;
}

const ProductSection = ({ 
  product
}: ProductSectionProps) => {
  return (
    <div className="w-full pt-2 grid grid-cols-1 lg:flex align-center justify-center gap-6 mb-16 px-4">
      <ProductImages product={product} />
      <ProductInfo product={product} />
    </div>
  );
};

export default ProductSection;