// Usar rota API do servidor para criar pedidos (evita expor credenciais e garante acesso ao .env)
export default  async function createBlackCatOrderd(orderData: any, creditCardData?: any) {
  // Construir uma chave de idempotência determinística a partir de dados do pedido
  const doc = orderData?.customer?.document?.number || ''
  const firstItemRef = orderData?.items?.[0]?.externalRef || ''
  const idemKey = `${doc}-${firstItemRef}` || `${Date.now()}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000) // 12s timeout
  try {
    const res = await fetch('/api/payments/blackcat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idemKey,
      },
      body: JSON.stringify({ orderData, creditCardData }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      let message = `Falha ao criar pedido Black Cat: ${res.status}`
      try {
        const data = await res.json()
        if (data?.error) message += ` - ${data.error}`
      } catch {}
      throw new Error(message)
    }
    return res.json()
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Tempo de requisição esgotado. Por favor, tente novamente.')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
