interface ReviewSectionProps {
    title: string
}

const ReviewSection = ({ title }: ReviewSectionProps) => {
  return (
    <div className="flex bg-[#FDF5E6] justify-between w-full">
      <h2 className="text-3xl font-syne font-bold">{title}</h2>

      <div className="w-full">
        <video 
          src="/review.mp4"
          className=""
        />
      </div>
    </div>
  )
}

export default ReviewSection