'use client'

import { ReviewType } from "@/app/types/Product";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import ReviewsCard from "./ReviewCard";
import { useState, useMemo } from "react";

interface ReviewsListProps {
  reviews: ReviewType[];
}

const REVIEWS_PER_PAGE = 10;
const MAX_VISIBLE_PAGES = 5;

export default function ReviewsList({ reviews }: ReviewsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = useMemo(() => 
    Math.ceil(reviews.length / REVIEWS_PER_PAGE), 
    [reviews.length]
  );

  const { currentReviews, startIndex, endIndex } = useMemo(() => {
    const start = (currentPage - 1) * REVIEWS_PER_PAGE;
    const end = start + REVIEWS_PER_PAGE;
    return {
      currentReviews: reviews.slice(start, end),
      startIndex: start,
      endIndex: end
    };
  }, [currentPage, reviews]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return Array.from({ length: MAX_VISIBLE_PAGES }, (_, i) => i + 1);
    }

    if (currentPage >= totalPages - 2) {
      return Array.from({ length: MAX_VISIBLE_PAGES }, (_, i) => totalPages - 4 + i);
    }

    return Array.from(
      { length: MAX_VISIBLE_PAGES }, 
      (_, i) => currentPage - 2 + i
    );
  };

  const NavigationButton = ({ 
    onClick, 
    disabled, 
    children 
  }: { 
    onClick: () => void, 
    disabled: boolean, 
    children: React.ReactNode 
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex text-orange-700 items-center gap-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
    >
      {children}
    </button>
  );

  if (!reviews.length) return null;

  return (
    <div className="px-6 flex flex-col items-center justify-center font-barlow py-8 gap-6">
      {currentReviews.map((review, index) => (
        <ReviewsCard key={startIndex + index} review={review} />
      ))}
      
      {reviews.length > REVIEWS_PER_PAGE && (
        <>
          <div className="flex items-center  justify-center gap-4 mt-8 mb-4">
            <NavigationButton 
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft className="text-sm " />
            </NavigationButton>
            
            <div className="flex font-syne items-center gap-2">
              {getPageNumbers().map(pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  className={`px-3 text-xl py-2 rounded-lg transition-colors ${
                    currentPage === pageNumber
                      ? 'text-zinc-700 font-bold'
                      : 'text-orange-500'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
            
            <NavigationButton 
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight className="text-sm" />
            </NavigationButton>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            Mostrando {startIndex + 1}-{Math.min(endIndex, reviews.length)} de {reviews.length} avaliações
          </div>
        </>
      )}
    </div>
  );
}
