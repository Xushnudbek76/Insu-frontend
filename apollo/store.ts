import { makeVar } from '@apollo/client';

import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';

export const userVar = makeVar<CustomJwtPayload | null>(null);

export const themeVar = makeVar<Record<string, unknown>>({});
