import type { Metadata, Viewport } from 'next';
import './globals.css';
import './dark-theme.css';
import { THEME_INIT_SCRIPT } from '@/lib/theme';

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
    <html lang="th" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
