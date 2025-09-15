import { NextRequest } from 'next/server'
import getClientIP from '../getClientIP'

function makeRequest(headers: Record<string, string>) {
  // @ts-expect-error simplify constructor for test
  return { headers: new Map(Object.entries(headers)) } as unknown as NextRequest
}

describe('getClientIP', () => {
  it('retorna primeiro IP de x-forwarded-for quando múltiplos', () => {
    const req = makeRequest({ 'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178' })
    expect(getClientIP(req)).toBe('203.0.113.195')
  })

  it('retorna x-real-ip quando presente', () => {
    const req = makeRequest({ 'x-real-ip': '198.51.100.7' })
    expect(getClientIP(req)).toBe('198.51.100.7')
  })

  it('retorna cf-connecting-ip quando presente', () => {
    const req = makeRequest({ 'cf-connecting-ip': '203.0.113.5' })
    expect(getClientIP(req)).toBe('203.0.113.5')
  })

  it('retorna 127.0.0.1 como fallback quando não houver headers', () => {
    const req = makeRequest({ })
    expect(getClientIP(req)).toBe('127.0.0.1')
  })

  it('lida com espaços e valores vazios em x-forwarded-for', () => {
    const req = makeRequest({ 'x-forwarded-for': '   10.0.0.1  ,   ' })
    expect(getClientIP(req)).toBe('10.0.0.1')
  })
})