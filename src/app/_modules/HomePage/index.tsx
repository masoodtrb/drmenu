'use client';

import React from 'react';

import { trpc } from '@/trpc/client';

export default function HomePage() {
  const { data } = trpc.test.getHello.useQuery();
  return <div>{data ? <>{data.message}</> : 'loading....'}</div>;
}
