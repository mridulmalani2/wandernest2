'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function RequestIdCleaner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const requestId = searchParams.get('id');
    if (requestId) {
      router.replace('/booking/success');
    }
  }, [router, searchParams]);

  return null;
}
