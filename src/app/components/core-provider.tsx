'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Dados sempre considerados desatualizados
      refetchOnWindowFocus: true, // Revalida quando a janela ganha foco
      refetchOnReconnect: true, // Revalida quando reconecta à internet
      retry: 3, // Tenta 3 vezes em caso de erro
    },
  },
})

export default function CoreProvider ({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}