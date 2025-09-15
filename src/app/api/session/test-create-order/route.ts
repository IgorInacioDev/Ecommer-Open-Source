import { NextRequest, NextResponse } from 'next/server'
import { updateNocoSession } from '@/app/api/db/session/updateNocoSession'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ip, createOrder } = body

    if (!ip) {
      return NextResponse.json(
        { error: 'IP é obrigatório' },
        { status: 400 }
      )
    }

    // Tentar atualizar o createOrder
    await updateNocoSession({
      ip,
      createOrder: createOrder ?? true
    })

    return NextResponse.json(
      { success: true, message: `createOrder atualizado para ${createOrder}` },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao atualizar createOrder:', error)
    
    // Se for o erro específico de proteção, retornar status 409 (Conflict)
    if (error instanceof Error && error.message.includes('createOrder não pode ser alterado')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}