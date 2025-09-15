import PromotionCarousel from "./PromotionCarrosel"
import Image from "next/image"

const BannerSection = () => {
  return (
    <div>
      <div className="relative">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/mobile/banner_mobile.gif"
          />
          <Image
            src="/banners/banner_victoria.png"
            alt="Banner"
            width={1920}
            height={300}
            className="mt-10"
          />
        </picture>
      </div>

      <PromotionCarousel />
    </div>
  )
}

export default BannerSection
