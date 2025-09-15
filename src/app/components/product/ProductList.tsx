'use client';

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ProductCard from "./ProductCard";
import { fetcherProducts } from "@/app/api/products/fetcherProducts";
import { ProductsResponseType } from "@/app/types/Product";
import Skeleton from "@/app/components/ui/Skeleton";

interface ProductListProps {
  maxColumns?: number; // número máximo de colunas do grid
  maxProducts?: number; // número máximo de produtos a exibir
  title?: string;
  smText?: string;
  showButton?: boolean;
  filterName?: string; // filtro por nome específico (ex: "kits")
}

const ProductListContent = ({ maxColumns, maxProducts, title, smText, showButton, filterName }: ProductListProps) => {
  const searchParams = useSearchParams();
  const categoryQuery = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  
  // Usa search se disponível, senão usa category
  const filterQuery = searchQuery || categoryQuery;
  
  const response = useQuery({
    queryKey: ['products'],
    queryFn: async () => fetcherProducts('/api/products?limit=200&shuffle=0&offset=0'),
    refetchInterval: 600000, // Revalida a cada 10 minutos
    refetchIntervalInBackground: true, // Continua revalidando mesmo quando a aba não está ativa
    staleTime: 0, // Considera os dados sempre desatualizados para forçar revalidação
  });

  if (response.isLoading) {
    return (
      <div className="space-y-6">
        {title && <Skeleton className="h-8 w-64" />}
        {smText && <Skeleton className="h-4 w-96" />}
        <div className={`grid gap-6 ${maxColumns === 2 ? 'grid-cols-1 md:grid-cols-2' : maxColumns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {[...Array(maxProducts || 8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  console.log(response.data);
  const { list } = response.data as ProductsResponseType
  console.log(list[0]);
  
  // Ordem específica dos produtos conforme solicitado
  const specificProductOrder = [
    'Kit Make Prática',
    'Kit Make Completona',
    'Protetor Solar em Bastão Com Cor FPS 95',
    'Bolsa Tote Ollie',
    'Kit Para Peles Oleosas',
    'Kit Para Toda a Família',
    'Bastão 3 em 1 Blush, Batom e Sombra FPS 95',
    'Creme Hidratante para Mãos FPS 60 FPUVA 22',
    'Garrafa Térmica 350ml PACCO & Ollie',
    'Glow Corporal FPS 40',
    'Hidratante Labial com FPS 50',
    'Kit Para Adultos e Pequenos',
    'Kit Para Corpo e Rosto',
    'Kit Para Peles Sensíveis',
    'Kit Pele Iluminada e Protegida Pro Verão',
    'Kit Resistência à Água para a Família',
    'Kit Textura Perfeita para Peles Oleosas',
    'Lenço de cetim Ollie',
    'Necessaire de telinha',
    'Pó Translúcido Facial FPS 30',
    'Protetor Solar Corporal Spray Bifásico FPS 35 FPUVA 12',
    'Protetor Solar em Bastão Incolor FPS 95',
    'Protetor Solar Infantil em Bastão Mineral FPS 80 FPUVA 30',
    'Protetor Solar Mineral Fluido FPS 50 FPUVA 16',
    'Protetor Solar Transparente Aveludado FPS 40'
  ];

  // Função para ordenar produtos conforme ordem específica
  const sortBySpecificOrder = <T extends { name: string }>(array: T[]): T[] => {
    return array.sort((a, b) => {
      const indexA = specificProductOrder.indexOf(a.name);
      const indexB = specificProductOrder.indexOf(b.name);
      
      // Se ambos estão na lista específica, ordena pela posição
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Se apenas A está na lista, A vem primeiro
      if (indexA !== -1 && indexB === -1) {
        return -1;
      }
      
      // Se apenas B está na lista, B vem primeiro
      if (indexA === -1 && indexB !== -1) {
        return 1;
      }
      
      // Se nenhum está na lista, mantém ordem original
      return 0;
    });
  };

  // Função para embaralhar array (Fisher-Yates shuffle)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Filtra produtos por nome se houver parâmetro de busca ou filterName
  let filteredProducts = list;
  if (filterQuery) {
    filteredProducts = list.filter(product => 
      product.name.toLowerCase().includes(filterQuery.toLowerCase())
    );
  } else if (filterName) {
    filteredProducts = list.filter(product => 
      product.name.toLowerCase().includes(filterName.toLowerCase())
    );
  } else {
    // Se não há filtros aplicados, usa a ordem específica dos produtos
    filteredProducts = sortBySpecificOrder(list);
  }
  
  // Aplica o limite de produtos se especificado
  const products = maxProducts ? filteredProducts.slice(0, maxProducts) : filteredProducts;

  return (
    <div className="mx-auto items-center justify-center px-4 sm:mx-w-3xl md:mx-w-4xl lg:max-w-5xl xl:max-w-11/14 py-16">
      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        <h2 className={`${smText ? `text-${smText}` : 'text-3xl'} flex flex-col md:flex-row items-center gap-2 tracking-wide font-barlow font-bold text-[#333333]`}>
          {searchQuery ? `Resultados para: "${searchQuery}"` : (title || '70% de desconto apenas esse mês!')}
        </h2>
      </div>
  
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            {filterQuery 
              ? `Nenhum produto encontrado para "${filterQuery}"` 
              : 'Nenhum produto disponível no momento'
            }
          </p>
          {filterQuery && (
            <p className="text-gray-400">
              Tente buscar por outros termos ou navegue por nossa categoria de produtos.
            </p>
          )}
        </div>
      ) : (
        <div className={`justify-center items-center grid my-12 grid-cols-2 xl:grid-cols-4 gap-6 ${
          maxColumns ? `2xl:grid-cols-${maxColumns}` : '2xl:grid-cols-5'
        }`}>
          {products.map((product) => (
            <ProductCard key={product.Id} product={product} showButton />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductList = (props: ProductListProps) => {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        {props.title && <Skeleton className="h-8 w-64" />}
        {props.smText && <Skeleton className="h-4 w-96" />}
        <div className={`grid gap-6 ${props.maxColumns === 2 ? 'grid-cols-1 md:grid-cols-2' : props.maxColumns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {[...Array(props.maxProducts || 8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    }>
      <ProductListContent {...props} />
    </Suspense>
  );
};

export default ProductList;
