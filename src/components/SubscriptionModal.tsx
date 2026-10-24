'use client';

import React from 'react';
import { Crown, Check, Zap, Sparkles, Shield, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionTier, TIER_CONFIGS } from '@/lib/types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  onSelectTier: (tier: SubscriptionTier) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  onSelectTier,
}) => {
  if (!isOpen) return null;

  const handleUpgrade = (tier: SubscriptionTier) => {
    // Trigger festive confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onSelectTier(tier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center font-bold transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-3 border border-amber-300">
            <Crown className="w-3.5 h-3.5 text-amber-700" />
            <span>&ldquo;Make Me Money&rdquo; Tiered Subscription Model</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ยกระดับการเดินทางด้วยแพ็กเกจ TripSure AI
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            เพิ่มโควตาการประมวลผล AI วางแผนเที่ยว ปลดล็อกตารางเปรียบเทียบราคา OTA เชิงลึก และฟรีค่าธรรมเนียมจัดทริป Escrow 100%
          </p>
        </div>

        {/* 3 Tier Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* FREE TIER */}
          <div className="rounded-2xl p-6 border-2 border-slate-200 bg-white flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="font-bold text-slate-700 text-base">Free Plan</div>
              <p className="text-xs text-slate-400 mt-0.5">สำหรับผู้ทดลองใช้งานทั่วไป</p>
              
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black font-mono text-slate-900">฿0</span>
                <span className="text-xs text-slate-400 ml-1">/ เดือน</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI วางแผนเที่ยว <strong>2 ครั้ง / เดือน</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>สร้างแผนการเดินทาง <strong>1 ตัวเลือก</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>พยากรณ์อากาศกรมอุตุฯ (TMD / Open-Meteo)</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-400 line-through">
                  <span>เปรียบเทียบราคา OTA เชิงลึก</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-400 line-through">
                  <span>ส่วนลดค่าเปิดทริป 3.5%</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('FREE')}
              disabled={currentTier === 'FREE'}
              className="mt-6 w-full py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {currentTier === 'FREE' ? 'ใช้งานแพ็กเกจนี้อยู่' : 'เลือก Free Plan'}
            </button>
          </div>

          {/* GOLD TIER */}
          <div className="rounded-2xl p-6 border-2 border-amber-400 bg-gradient-to-b from-amber-50/50 to-white flex flex-col justify-between shadow-lg relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
              คุ้มค่ายอดนิยม (Most Popular)
            </div>

            <div>
              <div className="font-extrabold text-amber-900 text-base flex items-center space-x-1.5">
                <span>Gold Plan</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs text-amber-700/80 mt-0.5">สำหรับสายเที่ยวตัวยงที่ชอบคุมงบ</p>

              <div className="mt-4 mb-6">
                <span className="text-3xl font-black font-mono text-slate-900">฿149</span>
                <span className="text-xs text-slate-400 ml-1">/ เดือน</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>AI วางแผนเที่ยว <strong>5 ครั้ง / เดือน</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>สร้างแผนพร้อมกัน <strong>3 แผนทางเลือก</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Deep OTA Price Comparison (Agoda vs Trip.com)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>ส่วนลดค่าเปิดทริป Escrow <strong>50%</strong></span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('GOLD')}
              disabled={currentTier === 'GOLD'}
              className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-md transition-all disabled:opacity-50"
            >
              {currentTier === 'GOLD' ? 'ใช้งานแพ็กเกจนี้อยู่' : 'อัปเกรดเป็น Gold (฿149)'}
            </button>
          </div>

          {/* PLATINUM TIER */}
          <div className="rounded-2xl p-6 border-2 border-indigo-600 bg-gradient-to-b from-indigo-50/50 to-white flex flex-col justify-between shadow-xl relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              SUPER HOST VIP
            </div>

            <div>
              <div className="font-extrabold text-indigo-950 text-base flex items-center space-x-1.5">
                <span>Platinum Plan</span>
                <Crown className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xs text-indigo-700/80 mt-0.5">สำหรับหัวหน้าทริป & ผู้จัดทริปมืออาชีพ</p>

              <div className="mt-4 mb-6">
                <span className="text-3xl font-black font-mono text-slate-900">฿299</span>
                <span className="text-xs text-slate-400 ml-1">/ เดือน</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>AI วางแผนเที่ยว <strong>ไม่จำกัดจำนวนครั้ง</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>สร้างแผนพร้อมกัน <strong>5 แผนทางเลือก</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Historical Season Price Alert แจ้งเตือนราคาลด</span>
                </li>
                <li className="flex items-center space-x-2 font-bold text-indigo-900">
                  <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>ฟรีค่าธรรมเนียมจัดทริป 3.5% (Waiver 0%)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('PLATINUM')}
              disabled={currentTier === 'PLATINUM'}
              className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-black shadow-md transition-all disabled:opacity-50"
            >
              {currentTier === 'PLATINUM' ? 'ใช้งานแพ็กเกจนี้อยู่' : 'อัปเกรดเป็น Platinum (฿299)'}
            </button>
          </div>

        </div>

        <div className="text-center text-xs text-slate-400 mt-6">
          * ระบบจำลองการชำระเงิน Stripe Checkout แบบสมจริงโดยไม่ต้องใส่บัตรเครดิตจริงสำหรับการตัดสิน Hackathon
        </div>

      </div>
    </div>
  );
};
