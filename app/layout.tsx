// app/layout.tsx
import '../styles/styles.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Is MAANG Up?',
  icons: {
    icon: '/favicon.ico',
    // or more icons if you like:
    // apple: '/apple-touch-icon.png',
    // etc.
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
