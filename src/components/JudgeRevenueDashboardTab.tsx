'use client';

import React, { useState } from 'react';
import { PlayCircle, History, TrendingUp } from 'lucide-react';
import { EscrowTransaction, EscrowTransactionType, RevenueMetrics } from '@/lib/types';

interface JudgeRevenueDashboardTabProps {
  revenueMetrics: RevenueMetrics;
  transactions: EscrowTransaction[];
  onSimulateSubscriptionUpgrade: () => void;
  onSimulateAffiliateClick: () => void;
  onSimulateCreationFee: () => void;
  onSimulateCancellationPenalty: () => void;
}

// Fixed series order; colours come from the validated --series-* tokens in globals.css
const STREAMS = [
  { key: 'subscriptionRevenue', label: 'ค่าสมาชิกรายเดือน', note: 'GOLD ฿149 · PLATINUM ฿299 ต่อเดือน', color: 'var(--series-1)' },
  { key: 'affiliateRevenue', label: 'คอมมิชชั่น OTA 4%', note: 'จองที่พักผ่าน Agoda และ Trip.com', color: 'var(--series-2)' },
  { key: 'creationFeeRevenue', label: 'ค่าเปิดทริป 3.5%', note: 'จากยอดรวมกองกลางของทริป', color: 'var(--series-3)' },
  { key: 'penaltyTaxRevenue', label: 'ส่วนแบ่งค่าปรับเททริป 5%', note: 'อีก 5% ชดเชยให้เพื่อนในกลุ่ม', color: 'var(--series-4)' },
] as const;

const TX_LABEL: Record<EscrowTransactionType, { label: string; color?: string }> = {
  SUBSCRIPTION_UPGRADE: { label: 'ค่าสมาชิก', color: 'var(--series-1)' },
  AFFILIATE_COMMISSION: { label: 'คอมมิชชั่น OTA', color: 'var(--series-2)' },
  CREATION_FEE_3_5: { label: 'ค่าเปิดทริป', color: 'var(--series-3)' },
  PENALTY_PLATFORM_5: { label: 'ค่าปรับ (แพลตฟอร์ม)', color: 'var(--series-4)' },
  PENALTY_POOL_5: { label: 'ค่าปรับ (ชดเชยกลุ่ม)' },
  DEPOSIT_ESCROW: { label: 'มัดจำ Escrow' },
};

export const JudgeRevenueDashboardTab: React.FC<JudgeRevenueDashboardTabProps> = ({
  revenueMetrics,
  transactions,
  onSimulateSubscriptionUpgrade,
  onSimulateAffiliateClick,
  onSimulateCreationFee,
  onSimulateCancellationPenalty,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const streamTotal = STREAMS.reduce((s, st) => s + revenueMetrics[st.key], 0);
  const shareOf = (v: number) => (streamTotal > 0 ? (v / streamTotal) * 100 : 0);

  const simulations = [
    { onClick: onSimulateSubscriptionUpgrade, delta: '+฿299', title: 'สมัคร PLATINUM', desc: 'เพิ่มรายได้ค่าสมาชิก', color: 'var(--series-1)' },
    { onClick: onSimulateAffiliateClick, delta: '+฿146', title: 'จองโรงแรมผ่าน Agoda', desc: 'ห้อง ฿3,650 คอมมิชชั่น 4%', color: 'var(--series-2)' },
    { onClick: onSimulateCreationFee, delta: '+฿980', title: 'เปิดทริปใหม่', desc: 'ทริป ฿28,000 ค่าธรรมเนียม 3.5%', color: 'var(--series-3)' },
    { onClick: onSimulateCancellationPenalty, delta: '+฿75', title: 'สมาชิกเททริป', desc: 'หักมัดจำ 10% แบ่งแพลตฟอร์ม/กลุ่ม 50:50', color: 'var(--series-4)' },
  ];

  return (
    <div className="space-y-10">

      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-slate-900">Judge Revenue</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600 leading-relaxed">
            รายได้ของแพลตฟอร์มจาก 4 ช่องทาง อัปเดตทันทีเมื่อมีธุรกรรมในระบบ
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          แดชบอร์ดสาธิตสำหรับกรรมการ · ข้อมูลจำลอง
        </span>
      </header>

      {/* Revenue mix */}
      <section className="rounded-xl bg-white border border-slate-200 shadow-sm p-5 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="text-sm text-slate-500">รายได้รวมของแพลตฟอร์ม</div>
            <div className="mt-1 font-mono text-5xl font-semibold text-slate-900 leading-none">
              ฿{revenueMetrics.totalRevenue.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              {transactions.length} ธุรกรรมในระบบ
            </div>
          </div>
          <p className="text-xs text-slate-500 lg:text-right max-w-xs">สัดส่วนรายได้แยกตามช่องทาง ชี้ที่แถบเพื่อดูยอด</p>
        </div>

        {/* Part-to-whole bar */}
        <div className="relative mt-7">
          <div className="flex h-10 gap-[2px]" role="img" aria-label="สัดส่วนรายได้ตามช่องทาง">
            {STREAMS.map((st, i) => {
              const share = shareOf(revenueMetrics[st.key]);
              if (share <= 0) return null;
              return (
                <div
                  key={st.key}
                  className={`h-full first:rounded-l last:rounded-r transition-opacity duration-150 cursor-default ${
                    hovered !== null && hovered !== i ? 'opacity-40' : ''
                  }`}
                  style={{ width: `${share}%`, backgroundColor: st.color }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
          </div>
          {hovered !== null && (
            <div
              className="absolute -top-2 -translate-y-full pointer-events-none rounded-md bg-ink-900 text-white text-xs px-3 py-2 shadow-lg whitespace-nowrap"
              style={{
                left: `${Math.min(
                  85,
                  STREAMS.slice(0, hovered).reduce((s, st) => s + shareOf(revenueMetrics[st.key]), 0) +
                    shareOf(revenueMetrics[STREAMS[hovered].key]) / 2
                )}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="font-semibold">{STREAMS[hovered].label}</div>
              <div className="font-mono text-ink-200">
                ฿{revenueMetrics[STREAMS[hovered].key].toLocaleString()} · {shareOf(revenueMetrics[STREAMS[hovered].key]).toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* Legend + values */}
        <table className="mt-6 w-full text-sm">
          <thead className="sr-only">
            <tr>
              <th>ช่องทาง</th>
              <th>ยอด</th>
              <th>สัดส่วน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {STREAMS.map((st, i) => (
              <tr
                key={st.key}
                className={`transition-colors ${hovered === i ? 'bg-slate-50' : ''}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <td className="py-3 pr-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: st.color }} aria-hidden />
                    <div>
                      <div className="font-medium text-slate-900">{st.label}</div>
                      <div className="text-xs text-slate-500">
                        {st.note}
                        {st.key === 'penaltyTaxRevenue' &&
                          ` · ชดเชยแล้ว ฿${revenueMetrics.escrowPoolSubsidiesGiven.toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                  ฿{revenueMetrics[st.key].toLocaleString()}
                </td>
                <td className="py-3 text-right font-mono text-slate-500 w-20">{shareOf(revenueMetrics[st.key]).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Demo controls */}
      <section>
        <div className="flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-slate-500" />
          <h3 className="font-display text-xl font-semibold text-slate-900">ทดลองสร้างธุรกรรม</h3>
        </div>
        <p className="mt-1 text-sm text-slate-500">กดเพื่อจำลองธุรกรรมแต่ละช่องทาง แล้วดูยอดด้านบนและสมุดบัญชีเปลี่ยนทันที</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {simulations.map((sim) => (
            <button
              key={sim.title}
              onClick={sim.onClick}
              className="group text-left rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-400"
            >
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: sim.color }} aria-hidden />
                <span className="font-mono text-sm font-semibold text-slate-900">{sim.delta}</span>
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-900">{sim.title}</div>
              <div className="mt-0.5 text-xs text-slate-500">{sim.desc}</div>
              <div className="mt-3 text-xs font-medium text-emerald-700 group-hover:text-emerald-800">จำลอง</div>
            </button>
          ))}
        </div>
      </section>

      {/* Unit economics */}
      <section>
        <h3 className="font-display text-xl font-semibold text-slate-900">Unit Economics</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          {[
            {
              title: 'Customer Lifetime Value',
              figure: '฿3,388',
              unit: 'ต่อคนต่อปี',
              body: 'ผู้ใช้เดินทางเฉลี่ย 3-5 ทริปต่อปี สมัคร GOLD (฿1,788 ต่อปี) และสร้างคอมมิชชั่น OTA เฉลี่ย ฿400 ต่อทริป',
            },
            {
              title: 'Customer Acquisition Cost',
              figure: '< ฿85',
              unit: 'ต่อคน',
              body: 'โตแบบ organic ผ่าน Community Escrow: โฮสต์ 1 คนดึงผู้ร่วมทริปเข้ามา 4-8 คนโดยอัตโนมัติ (viral coefficient k > 1.4)',
            },
            {
              title: 'Anti-Flake Moat',
              figure: 'Escrow + Trust',
              unit: '',
              body: 'มัดจำที่ล็อกไว้และทะเบียนความน่าเชื่อถือ ทำให้การหาเพื่อนร่วมทริปปลอดภัยกว่ากลุ่ม Facebook ทั่วไป',
            },
          ].map((u) => (
            <div key={u.title} className="border-t border-slate-200 pt-4">
              <div className="text-sm font-medium text-slate-500">{u.title}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold text-slate-900">{u.figure}</span>
                {u.unit && <span className="text-xs text-slate-500">{u.unit}</span>}
              </div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{u.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">ตัวเลขเป็นสมมติฐานทางธุรกิจสำหรับการนำเสนอ ไม่ใช่ข้อมูลผู้ใช้จริง</p>
      </section>

      {/* Ledger */}
      <section className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-200">
          <h3 className="font-display text-xl font-semibold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            สมุดบัญชีธุรกรรม
          </h3>
          <span className="text-xs font-mono text-slate-500">{transactions.length} รายการ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[720px]">
            <thead className="text-xs text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 sm:px-7 py-2.5 font-medium">เวลา</th>
                <th className="px-4 py-2.5 font-medium">ประเภท</th>
                <th className="px-4 py-2.5 font-medium">รายละเอียด</th>
                <th className="px-4 py-2.5 font-medium text-right">ยอดรวม</th>
                <th className="px-5 sm:px-7 py-2.5 font-medium text-right">รายได้แพลตฟอร์ม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.map((tx) => {
                const meta = TX_LABEL[tx.type];
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 sm:px-7 py-3 whitespace-nowrap text-xs text-slate-500">{tx.timestamp}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                        <span
                          className="w-2 h-2 rounded-sm"
                          style={{ backgroundColor: meta.color ?? 'transparent', boxShadow: meta.color ? undefined : 'inset 0 0 0 1px #8f9196' }}
                          aria-hidden
                        />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-md truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className="px-4 py-3 text-right font-mono whitespace-nowrap">฿{tx.amount.toLocaleString()}</td>
                    <td className="px-5 sm:px-7 py-3 text-right font-mono font-semibold whitespace-nowrap text-emerald-700">
                      {tx.platformRevenue > 0 ? `+฿${tx.platformRevenue.toLocaleString()}` : <span className="text-slate-400 font-normal">–</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
