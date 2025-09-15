'use client';

import Link from 'next/link';
import { useUTMPersistence } from '@/app/hooks/useUTMPersistence';
import { ComponentProps, useState, useEffect, Suspense } from 'react';

interface UTMLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string;
  additionalParams?: Record<string, string>;
}

/**
 * Componente Link que automaticamente preserva parâmetros UTM
 * Substitui o Link padrão do Next.js para manter UTMs durante navegação
 */
function UTMLinkContent({ href, additionalParams, ...props }: UTMLinkProps) {
  const { buildURLWithUTM } = useUTMPersistence();
  const [urlWithUTM, setUrlWithUTM] = useState(href); // Start with base href for SSR consistency
  
  useEffect(() => {
    // Only build URL with UTM on client side after hydration
    setUrlWithUTM(buildURLWithUTM(href, additionalParams));
  }, [href, additionalParams, buildURLWithUTM]);
  
  return <Link href={urlWithUTM} {...props} />;
}

export default function UTMLink({ href, ...props }: UTMLinkProps) {
  return (
    <Suspense fallback={<Link href={href} {...props} />}>
      <UTMLinkContent href={href} {...props} />
    </Suspense>
  );
}