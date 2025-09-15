import { nocoClient } from '../db/nocoClient';
import { ProductsResponseType } from '@/app/types/Product';

// Tabela de produtos no NocoDB
const PRODUCTS_TABLE_ID = 'm6bx9e2675jbfye';

// Função para gerar número "pseudo-aleatório" de avaliações, estável por Id
const generateRandomReviews = (productId: string): number => {
  const seed = parseInt(productId) || 1;
  const random = Math.sin(seed) * 10000;
  const normalized = Math.abs(random - Math.floor(random));
  return Math.floor(normalized * 8999) + 1000; // 1000..9999
};

export async function fetcherProductsServer({
  limit = 50,
  shuffle = 0,
  offset = 0
}: {
  limit?: number;
  shuffle?: number;
  offset?: number;
} = {}): Promise<ProductsResponseType> {
  try {
    const products = await nocoClient.listRecords<any>(PRODUCTS_TABLE_ID, {
      limit,
      shuffle,
      offset,
    });

    const { list, pageInfo } = products;

    const listWithReviews = (list || []).map((product: any) => ({
      ...product,
      reviewsCount: generateRandomReviews(String(product.Id ?? product.id ?? '1')),
    }));

    return { list: listWithReviews, pageInfo };
  } catch (error) {
    console.error('Erro ao buscar produtos (server-side):', error);
    throw error;
  }
}