import { FaPix } from "react-icons/fa6";

export default function PaymentMethods() {
  return (
    <div className="w-full font-barlow mt-6 border-zinc-200 border p-4">
      <h2 className="text-sm font-extrabold text-[#333333] mb-4">Métodos de Pagamento</h2>
      <div className="flex gap-2 font-bold text-[#333333] items-center text-sm">
        <FaPix className="text-[#E3BAE8] h-5 w-5"/>Pix
      </div>

    </div>
  )
}