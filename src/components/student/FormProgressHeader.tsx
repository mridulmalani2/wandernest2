'use client';

import { FormProgressHeader as SharedFormProgressHeader, Step } from '@/components/shared/FormProgressHeader';

export type { Step };

export function FormProgressHeader(props: any) {
  return <SharedFormProgressHeader {...props} variant="student" />;
}
