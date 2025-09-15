// Wrapper client-side para atualização de sessão via rota API
export default async function updateNocoSession(data: any) {
  try {
    const res = await fetch('/api/session/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Falha ao atualizar sessão: ${res.status} ${text}`)
    }
    return res.json().catch(() => ({}))
  } catch (e) {
    console.error(e)
    throw e
  }
}