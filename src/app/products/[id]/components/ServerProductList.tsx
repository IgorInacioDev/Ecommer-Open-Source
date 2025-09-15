import ServerProductCard from "./ServerProductCard";
import { fetcherProductsServer } from "@/app/api/products/fetcherProductsServer";
import { ProductType } from "@/app/types/Product";

interface ServerProductListProps {
  maxColumns?: number;
  maxProducts?: number;
  title?: string;
  currentProductId?: string; // Para excluir o produto atual da lista
}

const ServerProductList = async ({ 
  maxColumns = 4, 
  maxProducts = 8, 
  title = "Você também vai A-M-A-R",
  currentProductId
}: ServerProductListProps) => {
  try {
    const response = await fetcherProductsServer({ limit: 200, shuffle: 1, offset: 0 });
    
    let products = response.list || [];
    
    // Remove o produto atual da lista se fornecido
    if (currentProductId) {
      products = products.filter((product: ProductType) => product.Id.toString() !== currentProductId);
    }
    
    // Limita o número de produtos
    if (maxProducts) {
      products = products.slice(0, maxProducts);
    }

    const gridClasses = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    };

    return (
      <div className="w-full px-4 lg:px-16 py-16">
        {title && (
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 text-gray-800">
            {title}
          </h2>
        )}
        
        <div className={`grid grid-cols-2 gap-6 ${gridClasses[maxColumns as keyof typeof gridClasses] || gridClasses[4]}`}>
          {products.map((product: ProductType) => (
            <ServerProductCard key={product.Id} product={product} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading products:', error);
    return (
      <div className="w-full px-4 lg:px-16 py-16">
        {title && (
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 text-gray-800">
            {title}
          </h2>
        )}
        <p className="text-center text-gray-600">Erro ao carregar produtos relacionados.</p>
      </div>
    );
  }
};

export default ServerProductList;