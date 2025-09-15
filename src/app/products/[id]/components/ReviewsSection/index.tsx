import { ProductType } from "@/app/types/Product";
import ReviewStats from "./ReviewStats";
import ReviewsList from "./ReviewList";

export default function ReviewsSection({
  product,
}: {
  product: ProductType;
}) {
  return (
    <div className="bg-[#FAEDFF] text-center items-center pt-8">
      <h2 className="text-xl text-zinc-600 font-bold md:mb-4 font-syne ">Avaliações</h2>
      <ReviewStats reviews={product.reviews} />
      <ReviewsList reviews={product.reviews} />
    </div>
  );
}
