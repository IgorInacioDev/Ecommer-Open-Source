import Button from "@/app/components/common/Button";
import { ReviewType } from "@/app/types/Product";
import { FaStar, FaRegStar } from "react-icons/fa6";

export default function ReviewsSection({
  reviews,
}: {
  reviews: ReviewType[];
}) {
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / totalReviews;

  return (
    <div className="grid md:flex items-center justify-center font-barlow pt-3 md:pt-8 md:gap-24">
      <div className="text-sm flex mb-4 flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                star <= Math.round(averageRating) ? (
                  <FaStar key={star} size={20} className="text-yellow-400" />
                ) : (
                  <FaRegStar key={star} size={20} className="text-yellow-400" />
                )
              ))}
            </div>
            <span>{averageRating.toFixed(1)} de 5</span>
          </div>
          <span>Baseado em {(reviews.length)} avaliações ✅</span>
      </div>

      <div className="w-full mb-4 md:max-w-sm">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = reviews.filter(review => Math.round(review.rating) === stars).length;
          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
          
          return (
            <div key={stars} className="flex items-center gap-2 mb-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  star <= stars ? (
                    <FaStar key={star} size={14} className="text-yellow-400" />
                  ) : (
                    <FaRegStar key={star} size={14} className="text-yellow-400" />
                  )
                ))}
              </div>
              <div className="flex-1 bg-gray-200 h-4 mx-2">
                <div 
                  className="bg-purple-300 h-4 transition-all duration-300" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-4 text-right">{count}</span>
            </div>
          );
        })}
      </div>

      <Button className="md:max-w-46" title="Escrever uma avaliação" /> 
    </div>
  );
}
