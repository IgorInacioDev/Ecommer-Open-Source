import { PrizeType } from "@/app/types/types";
import Image from "next/image";

export default function Prize({ prize }: { prize: PrizeType }) {
  return (
    <div className="w-full gap-6 flex items-center bg-[#FDF5E6] text-[#2a2a2b] py-3 px-6 rounded-xs">
      <Image src="/necessaire.png" alt="Prize" width={70} height={70} className=""/>

      <div className="justify-center">
        <p className="text-sm font-syne font-extrabold tracking-widest">seus favoritos com BRINDE</p>
        <span className="text-sm font-normal font-syne">GANHE {prize.title} + frete grátis nas compras a partir de R$ 198*</span>
      </div>
    </div>
  )
}