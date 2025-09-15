import UTMLink from "@/app/components/common/UTMLink"

const Categories = () => {
  return (
    <div className="flex text-[#212122] gap-4 font-semibold text-sm font-syne items-center justify-center flex-1 mx-4 md:space-x-4">
      <UTMLink href="/products" className="hover:text-red-600 transition-colors">
        Produtos
      </UTMLink>
      <UTMLink href="/products" additionalParams={{ category: 'kit' }} className="hover:text-red-600 transition-colors">
        Kits
      </UTMLink>
      <UTMLink href="/products" additionalParams={{ category: 'kiko' }} className="hover:text-red-600 transition-colors">
        Kiko Milano
      </UTMLink>
      <UTMLink href="/products" additionalParams={{ category: 'dolce' }} className="hover:text-red-600 transition-colors">
        D&G + Victoria Secret
      </UTMLink>
    </div>
  )
}

export default Categories