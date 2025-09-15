import { NextRequest, NextResponse } from 'next/server'
import { nocoClient } from '../db/nocoClient'

// Tabela de produtos no NocoDB
const PRODUCTS_TABLE_ID = 'm6bx9e2675jbfye'

// Função para gerar número "pseudo-aleatório" de avaliações, estável por Id
const generateRandomReviews = (productId: string): number => {
  const seed = parseInt(productId) || 1
  const random = Math.sin(seed) * 10000
  const normalized = Math.abs(random - Math.floor(random))
  return Math.floor(normalized * 8999) + 1000 // 1000..9999
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit') ?? '50')
    const shuffle = Number(searchParams.get('shuffle') ?? '0')
    const offset = Number(searchParams.get('offset') ?? '0')

    const products = await nocoClient.listRecords<any>(PRODUCTS_TABLE_ID, {
      limit,
      shuffle,
      offset,
    })

    const { list, pageInfo } = products

    const listWithReviews = (list || []).map((product: any) => ({
      ...product,
      reviewsCount: generateRandomReviews(String(product.Id ?? product.id ?? '1')),
    }))

    return NextResponse.json({ list: listWithReviews, pageInfo }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar produtos (proxy server-side):', error)
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}