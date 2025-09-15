import Image from "next/image"

interface BannerItem {
  id: number;
  imageUrl: string;
  text: string;
}

const bannerItems: BannerItem[] = [
  {
    id: 1,
    imageUrl: "/necessaire.png",
    text: "GANHE NÉCESSAIRE + FRETE GRÁTIS a partir de R$ 198,00"
  }
];

const PromotionCarousel = () => {
  // Create 6 copies of the banner items for continuous scrolling
  const repeatedItems = [...Array(6)].map((_, index) => ({
    ...bannerItems[0],
    id: index + 1
  }));

  return (
    <div className="relative overflow-hidden whitespace-nowrap w-full bg-[#212122] text-[#FDF5E6] py-4">
      <div className="flex animate-marquee">
        {repeatedItems.map((item) => (
          <span key={item.id} className="mx-8 font-gotham gap-2 flex text-center items-center text-xl">
            <Image 
              src={item.imageUrl} 
              alt={`Banner ${item.id}`} 
              width={60} 
              height={60} 
            />
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PromotionCarousel;
