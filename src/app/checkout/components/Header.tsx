import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <div className="flex items-center lg:justify-center justify-between lg:gap-x-240 px-8 py-2 border-b border-[#e9d3ed]">
      <Link href="/">
        <Image
          src="/2-lure.png"
          alt="Lure Secret Logo"
          width={50}
          height={50}
        />
      </Link>

      
    <Image
        src="/icons/icone-bag.svg"
        alt="Shopping bag icon"
        width={30}
        height={30}
    />
    </div>
  )
}