import { ProductsResponseType } from "@/app/types/Product"

export async function fetcherProducts(url: string) {
  // Garantir que a URL seja absoluta (comece com '/') para evitar resolver relativo ao pathname atual
  let finalUrl = (url.startsWith('http') || url.startsWith('/')) ? url : `/${url}`;
  
  // Se estamos no servidor (não há window), construir URL completa
  if (typeof window === 'undefined' && !finalUrl.startsWith('http')) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    finalUrl = `${baseUrl}${finalUrl}`;
  }

  try {
    const res = await fetch(finalUrl, {
      method: 'GET',
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`Erro na requisição de produtos: ${res.status} ${res.statusText} - url: ${finalUrl}`)
    }

    const data = await res.json()
    return data as ProductsResponseType
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    throw error
  }
}