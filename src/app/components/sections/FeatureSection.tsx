import Image from "next/image";
import UTMLink from "@/app/components/common/UTMLink";

export interface FeatureSectionProps {
    title: string,
    description : string,
    bannerUrl: string,
    inverter?: boolean,
    button?: boolean
    bgColor?: string
    textColor?: string
}


const FeatureSection = ({ title, description, bannerUrl, inverter = false, button = true, bgColor = "#FDF5E6", textColor = "212122" }: FeatureSectionProps) => {
  const contentSection = (
    <div className={`w-full flex flex-col justify-center items-center text-center py-6`} style={{ backgroundColor: bgColor }}>
      <div className="max-w-3/4 text-start" style={{ color: textColor }}>
        <h2 className="text-2xl mb-4 font-syne font-bold">{title}</h2>
        <p className="font-barlow text-xl">{description}</p>

        {button && (
          <UTMLink className="flex rounded-xs justify-center bg-[#212122] max-w-56 mt-10" href="/products">
            <div className="text-sm text-center text-white py-3 font-barlow font-bold tracking-widest">
              VER PRODUTOS
            </div>
          </UTMLink>
        )}
      </div>
    </div>
  );

  const imageSection = (
    <div className="w-full">
      <Image 
        src={bannerUrl}
        alt={title}
        width={960}
        height={520}
        className="object-cover"
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:flex lg:flex-cols-1 w-full">
      {inverter ? (
        <>
          {imageSection}
          {contentSection}
        </>
      ) : (
        <>
          {contentSection}
          {imageSection}
        </>
      )}
    </div>
  )
}

export default FeatureSection