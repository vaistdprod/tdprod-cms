import React from 'react';
import { Montserrat } from 'next/font/google';
import '../../globals.css';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata = {
  title: 'Pediatric Clinic - Caring for Your Children',
  description: 'Professional pediatric care services with a gentle touch and years of expertise.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
