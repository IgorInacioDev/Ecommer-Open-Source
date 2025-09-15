import { NextRequest, NextResponse } from 'next/server'
import { updateNocoSession } from '@/app/api/db/session/updateNocoSession'
import { UpdateSessionDataType } from '@/app/types/Session'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as UpdateSessionDataType

    const result = await updateNocoSession(body, request)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error)
    return NextResponse.json({ error: 'Erro interno ao atualizar sessão' }, { status: 500 })
  }
}