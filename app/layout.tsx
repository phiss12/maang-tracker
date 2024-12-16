import React from 'react';
import '/styles/globals.css';
import Head from 'next/head';

export const metadata = {
  title: 'Is MAANG Up?'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        {/* Meta Tags */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Title */}
        <title>{metadata.title}</title>
      </Head>
      <body>
        {/* Main Content */}
        {children}
      </body>
    </html>
  );
}
