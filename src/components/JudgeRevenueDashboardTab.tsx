'use client';

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Percent,
  ShieldCheck,
  AlertTriangle,
  PlayCircle,
  Coins,
  ArrowUpRight,
  Sparkles,
  PieChart,
  History,
} from 'lucide-react';
import { EscrowTransaction, RevenueMetrics } from '@/lib/types';

interface JudgeRevenueDashboardTabProps {
  revenueMetrics: RevenueMetrics;
  transactions: EscrowTransaction[];
  onSimulateSubscriptionUpgrade: () => void;
  onSimulateAffiliateClick: () => void;
  onSimulateCreationFee: () => void;
  onSimulateCancellationPenalty: () => void;
}

export const JudgeRevenueDashboardTab: React.FC<JudgeRevenueDashboardTabProps> = ({
  revenueMetrics,
  transactions,
  onSimulateSubscriptionUpgrade,
  onSimulateAffiliateClick,
  onSimulateCreationFee,
  onSimulateCancellationPenalty,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* JUDGE WELCOME BANNER */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-950 via-slate-900 to-indigo-950 text-white border border-amber-600/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">
                <DollarSign className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                Hackathon Judge Demonstration Panel
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              📊 Live &ldquo;Make Me Money&rdquo; Revenue Engine
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              ติดตามรายได้จริงที่เกิดขึ้นแบบ Real-Time จาก 4 ช่องทางธุรกิจของ TripSure AI:
              ค่าสมาชิกรายเดือน, คอมมิชชั่น OTA Affiliate, ค่าธรรมเนียมเปิดทริป 3.5%, และส่วนแบ่งค่าปรับเททริป 5%
            </p>
          </div>

          {/* TOTAL REVENUE KPI HERO */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shrink-0 text-left md:text-right">
            <div className="text-xs font-medium text-amber-200">รายได้รวมของแพลตฟอร์ม (Total Revenue)</div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-amber-300 mt-1">
              ฿{revenueMetrics.totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-400 mt-1 font-semibold flex items-center justify-start md:justify-end space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{transactions.length} ธุรกรรมในระบบ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 REVENUE STREAMS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stream 1: Subscriptions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <CreditCard className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                Stream #1
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">ค่าสมาชิก AI รายเดือน</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              ฿{revenueMetrics.subscriptionRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gold (149 บ./ด.) & Platinum (299 บ./ด.)
            </p>
          </div>
        </div>

        {/* Stream 2: OTA Affiliate */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <ArrowUpRight className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                Stream #2
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">OTA Affiliate Commission (4%)</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              ฿{revenueMetrics.affiliateRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Agoda & Trip.com ส่วนแบ่งค่าคลิก/การจอง
            </p>
          </div>
        </div>

        {/* Stream 3: Creation Fee 3.5% */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Percent className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                Stream #3
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">ค่าเปิดทริป Escrow (3.5%)</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              ฿{revenueMetrics.creationFeeRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              3.5% จากยอดรวมกองกลางที่เปิดรับสมัคร
            </p>
          </div>
        </div>

        {/* Stream 4: Flake Penalty 5% */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                Stream #4
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">ส่วนแบ่งค่าปรับเททริป (5%)</div>
            <div className="text-2xl font-black font-mono text-rose-700 mt-1">
              ฿{revenueMetrics.penaltyTaxRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ชดเชยเพื่อนในกลุ่มแล้ว ฿{revenueMetrics.escrowPoolSubsidiesGiven.toLocaleString()}
            </p>
          </div>
        </div>

      </div>

      {/* QUICK SIMULATION TRIGGERS FOR JUDGES */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-lg font-bold flex items-center space-x-2 text-amber-300">
              <PlayCircle className="w-5 h-5 text-amber-400" />
              <span>Interactive Quick Simulation Triggers (สำหรับกรรมการทดสอบระบบ)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              คลิกปุ่มด้านล่างเพื่อทดสอบการทำงานของ Business Logic แต่ละช่องทางได้ทันที
            </p>
          </div>
          <span className="text-xs bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full font-mono font-semibold self-start sm:self-center">
            One-Click Test
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <button
            onClick={onSimulateSubscriptionUpgrade}
            className="p-3.5 rounded-xl bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-700/60 text-left transition-all group"
          >
            <div className="text-xs text-indigo-300 font-semibold group-hover:text-indigo-200">
              +฿299 (สมัคร Platinum)
            </div>
            <div className="font-bold text-sm text-white mt-1">จำลองคนซื้อแพ็กเกจ</div>
            <div className="text-[11px] text-slate-400 mt-1">เพิ่มรายได้ Subscription</div>
          </button>

          <button
            onClick={onSimulateAffiliateClick}
            className="p-3.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-700/60 text-left transition-all group"
          >
            <div className="text-xs text-emerald-300 font-semibold group-hover:text-emerald-200">
              +฿146 (โรงแรม 3,650 บ. @ 4%)
            </div>
            <div className="font-bold text-sm text-white mt-1">จำลองจองผ่าน Agoda</div>
            <div className="text-[11px] text-slate-400 mt-1">เพิ่มรายได้ Affiliate Commission</div>
          </button>

          <button
            onClick={onSimulateCreationFee}
            className="p-3.5 rounded-xl bg-teal-900/40 hover:bg-teal-900/60 border border-teal-700/60 text-left transition-all group"
          >
            <div className="text-xs text-teal-300 font-semibold group-hover:text-teal-200">
              +฿980 (ทริป 28,000 บ. @ 3.5%)
            </div>
            <div className="font-bold text-sm text-white mt-1">จำลองเปิดทริปใหม่</div>
            <div className="text-[11px] text-slate-400 mt-1">เพิ่มค่าคุ้มครองระบบ Escrow</div>
          </button>

          <button
            onClick={onSimulateCancellationPenalty}
            className="p-3.5 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/60 text-left transition-all group"
          >
            <div className="text-xs text-rose-300 font-semibold group-hover:text-rose-200">
              +฿75 แพลตฟอร์ม / +฿75 กลุ่ม
            </div>
            <div className="font-bold text-sm text-white mt-1">จำลองการเททริป (10%)</div>
            <div className="text-[11px] text-slate-400 mt-1">หักมัดจำ 150 บาท แบ่ง 50:50</div>
          </button>
        </div>
      </div>

      {/* UNIT ECONOMICS & MARKET ANALYSIS FOR JUDGES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-indigo-600" />
          <span>Unit Economics & Business Viability (วิเคราะห์ผลตอบแทนการลงทุน)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-700">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900 text-sm mb-1">
              Customer Lifetime Value (LTV)
            </div>
            <p className="leading-relaxed">
              ผู้ใช้สายเที่ยวเดินทางเฉลี่ย 3-5 ทริป/ปี สมัคร Gold Tier (149 บ./ด. = 1,788 บ./ปี)
              พร้อมสร้างค่าคอมมิชชั่น OTA เฉลี่ย 400 บาท/ทริป รวม LTV อยู่ที่ประมาณ <strong>3,388 บาท/คน/ปี</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900 text-sm mb-1">
              Customer Acquisition Cost (CAC)
            </div>
            <p className="leading-relaxed">
              Organic Growth ผ่านฟีเจอร์ Community Escrow เมื่อ Host สร้าง 1 ทริป จะดึงผู้ร่วมทริปเข้ามา 4-8 คนโดยอัตโนมัติ (Viral Coefficient k &gt; 1.4) ทำให้ CAC ต่ำกว่า <strong>85 บาท/คน</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900 text-sm mb-1">
              Anti-Flake Market Moat (คูเมืองธุรกิจ)
            </div>
            <p className="leading-relaxed">
              ระบบล็อกมัดจำ Escrow และทะเบียนคะแนนความน่าเชื่อถือ สมาชิกไม่สามารถไปหาคนหารทริปใน Facebook Groups ได้อย่างสบายใจเท่ากับบน TripSure AI ป้องกันปัญหาเททริปที่เกิดขึ้นบ่อยครั้งในไทย 100%
            </p>
          </div>
        </div>
      </div>

      {/* LIVE TRANSACTION LEDGER TABLE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>สมุดบัญชีรายได้ Real-Time (Live Transaction Ledger)</span>
          </h3>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {transactions.length} ธุรกรรม
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">เวลา</th>
                <th className="px-4 py-3">ประเภทธุรกรรม</th>
                <th className="px-4 py-3">รายละเอียด</th>
                <th className="px-4 py-3 text-right">ยอดเงินรวม</th>
                <th className="px-4 py-3 text-right text-emerald-700">รายได้แพลตฟอร์ม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-400 font-mono">
                    {tx.timestamp}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tx.type === 'SUBSCRIPTION_UPGRADE'
                          ? 'bg-indigo-100 text-indigo-800'
                          : tx.type === 'AFFILIATE_COMMISSION'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.type === 'CREATION_FEE_3_5'
                          ? 'bg-teal-100 text-teal-800'
                          : tx.type === 'PENALTY_PLATFORM_5'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-md truncate">
                    {tx.description}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">
                    ฿{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                    {tx.platformRevenue > 0 ? `+฿${tx.platformRevenue.toLocaleString()}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
