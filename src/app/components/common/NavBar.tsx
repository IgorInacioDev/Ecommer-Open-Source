'use client';

import Image from "next/image"
import UTMLink from "@/app/components/common/UTMLink"
import Categories from "@/app/components/layout/Header/Categories"
import Search from "@/app/components/layout/Header/Search"
import { useCart } from "@/app/contexts/CartContext"
import { usePathname } from "next/navigation"
import { useState } from "react"

const NavBar = () => {
  const { openCart, getTotalItems } = useCart();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Não exibe o NavBar na página de checkout
  if (pathname === '/checkout') {
    return null;
  }
  return (
    <nav className='w-full border-b  border-zinc-200 bg-[#F5F5F5]'>
      <p className='text-[#F5F5F5] text-[10px] font-extrabold tracking-widest font-montserrat text-center py-3 uppercase bg-[#E7002A]'>
        edição limitada! até 70%OFF
      </p>
      <div className="mx-auto py-3  px-4 sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-9/12 w-full flex items-center justify-between">
        {/* Menu Hamburger e Search - Mobile Left */}
        <div className="md:hidden py-1 flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1 hover:opacity-70 transition-opacity"
            aria-label="Abrir menu"
          >
            <Image
              src="/icons/icone-hamburger.png"
              alt="Menu icon"
              width={30}
              height={30}
            />
          </button>
          <Search />
        </div>

        {/* Logo - Mobile Center, Desktop Left */}
        <UTMLink href="/" className="md:order-1">
          <Image
            src="/2-lure.png"
            alt="Lure Secret"
            width={40}
            height={40} />
        </UTMLink>

        {/* Categories - Desktop Only */}
        <div className="hidden md:block md:order-2">
          <Categories />
        </div>

        {/* Icons - Mobile Right (Account + Bag), Desktop Right (Search + Account + Bag) */}
        <div className="flex items-center gap-4 md:gap-6 md:order-3">
          {/* Search - Desktop Only */}
          <div className="hidden md:block">
            <Search />
          </div>
          {/* Account Icon */}
          <Image
            src="/icons/icone-account.svg"
            alt="Account icon"
            width={30}
            height={30}
          />
          {/* Bag Icon */}
          <button 
            onClick={openCart}
            className="relative hover:opacity-70 transition-opacity"
          >
            <Image
              src="/icons/icone-bag.svg"
              alt="Shopping bag icon"
              width={30}
              height={30}
            />
            {getTotalItems() > 0 && (
              <span className="absolute font-barlow -top-1 -right-2 bg-[#212122] text-[#F5F5F5] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Modal Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed font-barlow inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="absolute top-0 left-0 w-80 h-full bg-white shadow-lg transform transition-transform duration-300">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Fechar menu"
              >
                <svg 
                  className="w-6 h-6 text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
            
            {/* Categorias do Menu */}
            <div className="p-4">
              <nav className="space-y-4">
                <UTMLink 
                  href="/products" 
                  className="block py-3 px-4 text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Produtos
                </UTMLink>
                <UTMLink 
                  href="/products" 
                  additionalParams={{ category: 'kit' }}
                  className="block py-3 px-4 text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Kits
                </UTMLink>
                <UTMLink 
                  href="/" 
                  className="block py-3 px-4 text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Kiko Milano
                </UTMLink>
                <UTMLink 
                  href="/products" 
                  additionalParams={{ category: 'club' }}
                  className="block py-3 px-4 text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  D&G + Victoria Secret
                </UTMLink>
              </nav>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavBar
