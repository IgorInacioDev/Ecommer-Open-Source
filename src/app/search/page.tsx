'use client'

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../components/common/Footer';
import { useUTMPersistence } from '../hooks/useUTMPersistence';
import Skeleton from '../components/ui/Skeleton';

const SearchPageContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { buildURLWithUTM } = useUTMPersistence();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navega para a página de produtos com o parâmetro de busca e UTM persistidos
      const searchUrl = buildURLWithUTM('/products', { search: encodeURIComponent(searchTerm.trim()) });
      router.push(searchUrl);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Buscar Produtos</h1>
        
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome do produto..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 text-[#F5F5F5] rounded-lg hover:bg-red-700 transition-colors"
            >
              Buscar
            </button>
          </div>
        </form>

        <div className="text-center text-gray-600 mb-8">
          <p>Exemplos de busca:</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <button
              onClick={() => setSearchTerm('protetor')}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              protetor
            </button>
            <button
              onClick={() => setSearchTerm('solar')}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              solar
            </button>
            <button
              onClick={() => setSearchTerm('hidratante')}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              hidratante
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

const SearchPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen pt-16 bg-white flex items-center justify-center"><Skeleton className="h-8 w-64" /></div>}>
      <SearchPageContent />
    </Suspense>
  );
};

export default SearchPage;