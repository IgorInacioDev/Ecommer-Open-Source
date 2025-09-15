'use client';

import { Suspense } from 'react';
import AppProductsDataTable from '@/app/components/admin/AppProductsDataTable';
import Skeleton from '@/app/components/ui/Skeleton';

const AdminProductsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Produtos</h1>
          <p className="mt-2 text-gray-600">
            Visualize e gerencie todos os produtos do seu e-commerce com paginação automática.
          </p>
        </div>

        {/* Tabela de produtos com paginação */}
        <Suspense 
          fallback={
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-64" />
              </div>
              <div className="bg-white border rounded-lg p-6">
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-16 w-16" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <AppProductsDataTable itemsPerPage={15} />
        </Suspense>
      </div>
    </div>
  );
};

export default AdminProductsPage;