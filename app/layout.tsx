import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'LeadsMapping — Lead Prioritization Prototype',
  description: 'Conceptual lead prioritization dashboard with synthetic data.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
