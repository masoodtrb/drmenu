'use client';

import { trpc } from '@/trpc/client';
import React from 'react'

export default function HomePage() {
    const { data } = trpc.test.getHello.useQuery();
    return (
        <div>
            {data ? (
                <>
                    {data.message}
                </>
            ) : 'loading....'}
        </div>
    )
}
