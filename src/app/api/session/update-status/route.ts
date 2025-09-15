import { NextRequest, NextResponse } from 'next/server'
import { updateNocoSession } from '@/app/api/db/session/updateNocoSession'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ip, status } = body

    if (!ip) {
      return NextResponse.json(
        { error: 'IP é obrigatório' },
        { status: 400 }
      )
    }

    // Atualizar o status da sessão
    await updateNocoSession({
      ip,
      status: status ?? false
    })

    return NextResponse.json(
      { success: true, message: `Status atualizado para ${status}` },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao atualizar status da sessão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}