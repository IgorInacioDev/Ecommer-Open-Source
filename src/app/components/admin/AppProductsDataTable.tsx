'use client';

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetcherProducts } from "@/app/api/products/fetcherProducts";
import { ProductsResponseType, ProductType } from "@/app/types/Product";
import Skeleton from "@/app/components/ui/Skeleton";
import Image from "next/image";

interface AppProductsDataTableProps {
  itemsPerPage?: number;
}

const AppProductsDataTable = ({ itemsPerPage = 10 }: AppProductsDataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => fetcherProducts('/api/products?limit=100&shuffle=0&offset=0'),
    refetchInterval: 600000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4">
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>
          {[...Array(itemsPerPage)].map((_, i) => (
            <div key={i} className="p-4 border-t">
              <div className="grid grid-cols-5 gap-4 items-center">
                <Skeleton className="h-16 w-16" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar produtos</p>
      </div>
    );
  }

  const { list } = data as ProductsResponseType;
  
  // Filtrar produtos baseado no termo de busca
  const filteredProducts = list.filter((product: ProductType) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginação
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Funções de navegação
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Resetar página quando buscar
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Gerar números das páginas para exibir
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header com busca */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Produtos ({totalItems})</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Header da tabela */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-6 gap-4 font-semibold text-gray-700">
            <div>Imagem</div>
            <div className="col-span-2">Nome do Produto</div>
            <div>Preço Original</div>
            <div>Preço Promocional</div>
            <div>Status</div>
          </div>
        </div>

        {/* Corpo da tabela */}
        <div className="divide-y divide-gray-200">
          {currentProducts.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {searchTerm ? 'Nenhum produto encontrado para a busca.' : 'Nenhum produto disponível.'}
            </div>
          ) : (
            currentProducts.map((product: ProductType) => (
              <div key={product.Id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-6 gap-4 items-center">
                  {/* Imagem */}
                  <div className="flex-shrink-0">
                    {product.Images && product.Images.length > 0 ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={product.Images[0].url}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Sem imagem</span>
                      </div>
                    )}
                  </div>

                  {/* Nome do produto */}
                  <div className="col-span-2">
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ID: {product.Id}
                    </p>
                  </div>

                  {/* Preço original */}
                  <div>
                    <span className="text-gray-900 font-medium">
                      R$ {(product.original_price / 100).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>

                  {/* Preço promocional */}
                  <div>
                    {product.sale_price ? (
                      <span className="text-red-600 font-medium">
                        R$ {(product.sale_price / 100).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.sale_price 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.sale_price ? 'Promoção' : 'Normal'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} produtos
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Botão Anterior */}
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>

            {/* Números das páginas */}
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Botão Próximo */}
            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppProductsDataTable;