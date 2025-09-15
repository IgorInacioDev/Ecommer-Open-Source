/**
 * Remove o domínio do banco de dados das URLs de imagem e retorna apenas a URL original
 * @param url - URL que pode conter o domínio do banco
 * @returns URL limpa sem o domínio do banco
 */
export function cleanImageUrl(url: string): string {
  const dbDomain = 'https://white-nocodb.5zd9ii.easypanel.host';
  
  // Se a URL contém o domínio do banco, remove ele
  if (url.includes(dbDomain)) {
    // Remove o domínio do banco e a barra inicial se existir
    return url.replace(dbDomain + '/', '').replace(dbDomain, '');
  }
  
  // Se não contém o domínio do banco, retorna a URL original
  return url;
}