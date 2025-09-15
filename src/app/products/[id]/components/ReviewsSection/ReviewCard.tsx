import { ReviewType } from "@/app/types/Product";
import { BiSolidDislike, BiSolidLike } from "react-icons/bi";
import { FaStar, FaRegStar } from "react-icons/fa";

export default function ReviewsCard({
  review,
}: {
  review: ReviewType;
}) {
  return (
    <div className="flex w-full max-w-4xl justify-between font-syne pt-8 gap-6">
      <div className="flex-1 items-start text-start">
        <div className="mb-5">
          <div className="flex mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              star <= Math.round(review.rating) ? (
                <FaStar key={star} className="text-yellow-400" />
              ) : (
                <FaRegStar key={star} className="text-yellow-400" />
              )
            ))}
          </div>
          <h1 className="uppercase items-center flex font-bold text-zinc-700">{review.reviewerName} <span className="ml-2 text-xs text-[#F5F5F5]  bg-purple-400/70 py-0.5 px-2">Verificado</span></h1>
        </div>
        
        <div className="mb-5 text-sm text-zinc-700">
            <h1 className="font-bold">{review.reviewTitle}</h1>
            <span>{review.reviewText}</span>
        </div>

        <div className="grid gap-1 text-orange-600">
            <span>Qual o tipo de pele do seu rosto? <span className="text-zinc-700">{review.skinType}</span></span>
            <span>Características da sua pele: <span className="text-zinc-700">{review.skinFeatures}</span></span>
            <span>Qual a sua idade? <span className="text-zinc-700">{review.ageRange}</span></span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 min-w-fit">
        <span className="text-xs text-zinc-600 font-medium whitespace-nowrap">1 mês atrás</span>
        
        <div className="flex text-sm gap-2 text-zinc-500">
          <BiSolidLike className="text-orange-600"/>{review.likes} <BiSolidDislike className="text-orange-600"/>{review.dislikes}
        </div>
      </div>
    </div>
  );
}
