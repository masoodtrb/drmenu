import type { Metadata } from 'next';

import StoreLayoutWrapper from '@/components/StoreLayoutWrapper';

export const metadata: Metadata = {
  title: 'فروشگاه - DrMenu',
  description: 'پنل مدیریت فروشگاه',
};

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StoreLayoutWrapper>{children}</StoreLayoutWrapper>;
}
