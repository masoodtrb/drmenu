import { cache } from 'react';

import { QueryClient } from '@tanstack/react-query';

export const getServerQueryClient = cache(() => new QueryClient());
