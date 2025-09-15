'use client'

import Image from "next/image"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useUTMPersistence } from "@/app/hooks/useUTMPersistence"

interface SearchProps {
  onSearch?: (query: string) => void;
}

const SearchContent = ({ onSearch }: SearchProps) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { buildURLWithUTM } = useUTMPersistence()

  const handleSearchStateChange = (expanded: boolean) => {
    setIsSearchExpanded(expanded)
    if (!expanded) {
      setSearchValue('')
    }
  }

  // Função para lidar com a busca
  const handleSearch = () => {
    if (searchValue.trim()) {
      const searchUrl = buildURLWithUTM('/products', { search: encodeURIComponent(searchValue) })
      router.push(searchUrl)
      setIsSearchExpanded(false)
      setSearchValue('')
    }
  }

  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchExpanded])

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSearchExpanded) {
        handleSearchStateChange(false)
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isSearchExpanded])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleSearchStateChange(false)
      }
    }

    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSearchExpanded])

  const SearchIcon = () => (
    <Image 
      src="/icons/icone-lupa.svg"
      alt="Search icon"
      width={24} 
      height={24}
      className="w-6 h-6"
    />
  )

  const CloseIcon = () => (
    <svg 
      className="w-6 h-6 text-gray-600 hover:text-gray-800" 
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
  )

  return (
    <>
      {/* Mobile Search Button */}
      {!isSearchExpanded && (
        <button
          onClick={() => handleSearchStateChange(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
          aria-label="Abrir busca"
        >
          <SearchIcon />
        </button>
      )}

      {/* Mobile Search Modal */}
      {isSearchExpanded && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => handleSearchStateChange(false)}
          />
          
          {/* Modal Content */}
          <div 
            ref={containerRef}
            className="relative font-syne bg-white h-full flex flex-col"
          >
            {/* Header da busca expandida */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Buscar produtos</h2>
              <button
                onClick={() => handleSearchStateChange(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Fechar busca"
              >
                <CloseIcon />
              </button>
            </div>
            
            {/* Input de busca expandido */}
            <div className="p-4 flex-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSearch()
                }}
                className="flex items-center w-full"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Digite o que você procura..."
                    className="w-full h-12 pl-4 pr-12 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                    aria-label="Buscar"
                  >
                    <SearchIcon />
                  </button>
                </div>
              </form>
              
              {/* Sugestões de busca populares */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Buscas populares</h3>
                <div className="flex flex-wrap gap-2">
                  {['Protetor solar', 'Hidratante', 'Kit verão', 'FPS 60'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setSearchValue(suggestion)
                        handleSearch()
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Search */}
       <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch()
          }}
          className="relative flex-1 mx-6"
        >
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Digite o que você procura..."
            className="w-full h-10 pl-4 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Buscar"
          >
            <SearchIcon />
          </button>
        </form>
      </div>
    </>
  )
}

const Search = (props: SearchProps) => {
  return (
    <Suspense fallback={
      <div className="flex items-center">
        <Image
          src="/icons/icone-lupa.svg"
          alt="Search"
          width={20}
          height={20}
          className="cursor-pointer"
        />
      </div>
    }>
      <SearchContent {...props} />
    </Suspense>
  )
}

export default Search