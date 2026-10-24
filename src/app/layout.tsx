import type { Metadata, Viewport } from 'next';
import { Anuphan, Trirong, Prompt, Caveat } from 'next/font/google';
import './globals.css';
import './dark-theme.css';
import { THEME_INIT_SCRIPT } from '@/lib/theme';

// Anuphan carries the interface and data; Trirong (looped Thai serif) sets editorial headlines
const uiFont = Anuphan({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
});
const displayFont = Trirong({
  subsets: ['thai', 'latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

// Landing page: Prompt for Thai UI copy, Caveat for the handwritten accents
const promptFont = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
  display: 'swap',
});
const scriptFont = Caveat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-script',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'TripSure AI (ทริปชัวร์) — AI วางแผนเที่ยว & ระบบ Escrow สัญญาค้ำประกันทริป ไม่เท 100%',
  description: 'แพลตฟอร์มแรกในไทยที่ผสาน AI Smart Trip Planner, OTA Price Comparator และระบบ Smart Escrow ล็อกเงินมัดจำ ป้องกันการเททริป ชดเชยเพื่อนร่วมทริปโปร่งใส 100%',
  keywords: [
    'TripSure AI',
    'ทริปชัวร์',
    'วางแผนเที่ยว AI',
    'หารทริปเที่ยว',
    'ระบบค้ำประกันทริป',
    'Escrow ท่องเที่ยว',
    'เปรียบเทียบราคา Agoda Trip.com',
    'เที่ยวไม่โดนเท',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning className={`theme-blue ${uiFont.variable} ${displayFont.variable} ${promptFont.variable} ${scriptFont.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-prompt">
        {children}
      </body>
    </html>
  );
}
