import Search from "./Search";
import Image from "next/image";

interface IconProps {
  src: string;
  alt: string;
}

const IconImage = ({ src, alt }: IconProps) => (
  <Image
    src={src}
    alt={alt}
    width={24}
    height={24}
    className="w-6 h-6"
  />
);

const HeaderIcons = () => {
  return (
    <div className="flex items-center gap-6">
      <Search />
      <IconImage
        src="/icons/icone-account.svg"
        alt="Account icon"
      />
      <IconImage
        src="/icons/icone-bag.svg"
        alt="Shopping bag icon"
      />
    </div>
  );
};

export default HeaderIcons;
