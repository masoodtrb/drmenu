'use client';

import { PropsWithChildren } from 'react';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const TanStackReactQueryDevtools = ({ children }: PropsWithChildren) => {
  return (
    <>
      {children}
      <div dir="ltr">
        <ReactQueryDevtools />
      </div>
    </>
  );
};
