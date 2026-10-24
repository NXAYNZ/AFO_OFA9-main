import { NextRequest, NextResponse } from 'next/server';
import { EscrowTransaction, SubscriptionTier, TIER_CONFIGS, quotaLabel } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      /**
       * 1. CREATE COMMUNITY TRIP ("Make Me Money" 3.5% Platform Creation Fee)
       */
      case 'CREATE_TRIP': {
        const {
          title,
          destination,
          travelDates,
          totalSlots = 8,
          costPerPerson = 3500,
          securityDepositPerPerson = 1500,
          userTier = 'FREE',
          userName = 'Host User',
        } = payload;

        const totalPoolTarget = totalSlots * costPerPerson;
        const tierConfig = TIER_CONFIGS[userTier as SubscriptionTier] || TIER_CONFIGS.FREE;

        // 3.5% creation fee with tier waiver (Platinum gets 100% discount / 0% fee)
        const baseCreationFee = totalPoolTarget * 0.035;
        const discountRate = tierConfig.creationFeeDiscountPercent / 100;
        const finalCreationFee = Math.round(baseCreationFee * (1 - discountRate));

        const transaction: EscrowTransaction = {
          id: `tx_${Date.now()}`,
          tripId: `trip_${Date.now()}`,
          userName,
          type: 'CREATION_FEE_3_5',
          amount: totalPoolTarget,
          platformRevenue: finalCreationFee,
          description: `ค่าธรรมเนียมคุ้มครองแพลตฟอร์ม 3.5% ทริป ${destination} (ส่วนลดระดับ ${userTier} ${tierConfig.creationFeeDiscountPercent}%)`,
          timestamp: 'เพิ่งเกิดขึ้น',
        };

        return NextResponse.json({
          success: true,
          message: `เปิดทริปสำเร็จ! หักค่าธรรมเนียมคุ้มครองระบบ ${finalCreationFee.toLocaleString()} บาท`,
          finalCreationFee,
          baseCreationFee,
          discountAmount: Math.round(baseCreationFee * discountRate),
          transaction,
        });
      }

      /**
       * 2. JOIN TRIP & HOLD SECURITY DEPOSIT IN ESCROW
       */
      case 'JOIN_TRIP': {
        const {
          tripId,
          tripTitle,
          userName = 'คุณ (กรรมการ Hackathon)',
          depositAmount = 1500,
        } = payload;

        const transaction: EscrowTransaction = {
          id: `tx_${Date.now()}`,
          tripId,
          userName,
          type: 'DEPOSIT_ESCROW',
          amount: depositAmount,
          platformRevenue: 0, // Escrow deposit is held in trust, not platform revenue
          description: `วางเงินค้ำประกัน (Escrow Deposit) ล็อกที่นั่งทริป "${tripTitle}" เรียบร้อย`,
          timestamp: 'เพิ่งเกิดขึ้น',
        };

        return NextResponse.json({
          success: true,
          message: `เข้าร่วมทริปและวางเงินมัดจำ ${depositAmount.toLocaleString()} บาท เข้าสู่ระบบ Escrow สำเร็จ`,
          depositAmount,
          escrowStatus: 'HELD',
          transaction,
        });
      }

      /**
       * 3. SIMULATE FLAKE / CANCELLATION (10% Penalty Tax Engine)
       * Breakdown: 5% to Platform Revenue + 5% to Remaining Trip Pool Subsidies
       */
      case 'CANCEL_TRIP': {
        const {
          tripId,
          tripTitle,
          userName = 'กริช สายปาร์ตี้ (บอย)',
          depositAmount = 1500,
          remainingMembersCount = 5,
        } = payload;

        // 10% penalty tax
        const totalPenalty = Math.round(depositAmount * 0.10); // 150 THB
        const platformShare = Math.round(totalPenalty * 0.50); // 75 THB (5%)
        const poolSubsidies = Math.round(totalPenalty * 0.50); // 75 THB (5%)
        const refundedToUser = depositAmount - totalPenalty;   // 1,350 THB
        const subsidyPerRemainingMember = Math.round(poolSubsidies / Math.max(1, remainingMembersCount));

        const platformTx: EscrowTransaction = {
          id: `tx_pen_plat_${Date.now()}`,
          tripId,
          userName,
          type: 'PENALTY_PLATFORM_5',
          amount: totalPenalty,
          platformRevenue: platformShare,
          description: `ภาษีค่าปรับเททริป 5% เข้าแพลตฟอร์มจาก ${userName} (ทริป ${tripTitle})`,
          timestamp: 'เพิ่งเกิดขึ้น',
        };

        const poolTx: EscrowTransaction = {
          id: `tx_pen_pool_${Date.now()}`,
          tripId,
          userName,
          type: 'PENALTY_POOL_5',
          amount: poolSubsidies,
          platformRevenue: 0,
          poolAddition: poolSubsidies,
          description: `เงินชดเชยกองกลาง 5% (${poolSubsidies} THB) กระจายให้สมาชิกที่เหลือ ${remainingMembersCount} คน (~${subsidyPerRemainingMember} บาท/คน)`,
          timestamp: 'เพิ่งเกิดขึ้น',
        };

        return NextResponse.json({
          success: true,
          message: `จำลองการเททริปสำเร็จ: ระบบหักค่าปรับ 10% (${totalPenalty.toLocaleString()} บาท) โดยแบ่งเข้าแพลตฟอร์ม 5% และชดเชยเพื่อนร่วมทริป 5%`,
          depositAmount,
          totalPenalty,
          platformShare,
          poolSubsidies,
          refundedToUser,
          subsidyPerRemainingMember,
          transactions: [platformTx, poolTx],
          updatedWarningTag: '⚠️ เคยเททริปกระทันหัน (ถูกหักเงินมัดจำ 10% ตามสัญญา Escrow)',
        });
      }

      /**
       * 4. UPGRADE SUBSCRIPTION (Stripe Checkout Simulator)
       */
      case 'UPGRADE_SUBSCRIPTION': {
        const { targetTier, userName = 'คุณ (กรรมการ Hackathon)' } = payload;
        const tierConfig = TIER_CONFIGS[targetTier as SubscriptionTier] || TIER_CONFIGS.GOLD;

        const transaction: EscrowTransaction = {
          id: `tx_sub_${Date.now()}`,
          userName,
          type: 'SUBSCRIPTION_UPGRADE',
          amount: tierConfig.priceMonthly,
          platformRevenue: tierConfig.priceMonthly,
          description: `อัปเกรดสมาชิกเป็น ${tierConfig.labelThai} (โควตา AI ${quotaLabel(tierConfig.name)})`,
          timestamp: 'เพิ่งเกิดขึ้น',
        };

        return NextResponse.json({
          success: true,
          message: `อัปเกรดเป็น ${tierConfig.labelThai} สำเร็จ! ปลดล็อกโควตา AI และฟีเจอร์พรีเมียมเรียบร้อย`,
          newTier: targetTier,
          pricePaid: tierConfig.priceMonthly,
          maxQuotas: tierConfig.maxQuotas,
          transaction,
        });
      }

      /**
       * 5. RECORD OTA AFFILIATE CLICK / BOOKING COMMISSION (est. 4%)
       */
      case 'RECORD_AFFILIATE_CLICK': {
        const {
          provider = 'Trip.com',
          productName = 'Sai Kaew Beach Resort',
          price = 3650,
          commissionRate = 0.04,
        } = payload;

        const commissionAmount = Math.round(price * commissionRate);

        const transaction: EscrowTransaction = {
          id: `tx_aff_${Date.now()}`,
          type: 'AFFILIATE_COMMISSION',
          amount: price,
          platformRevenue: commissionAmount,
          description: `รับส่วนแบ่งคอมมิชชั่น OTA Affiliate (${provider}) 4% จากการจอง "${productName}"`,
          timestamp: 'เพิ่งเกิดขึ้น',
        };

        return NextResponse.json({
          success: true,
          message: `บันทึกคอมมิชชั่น Affiliate ${provider} สำเร็จ (${commissionAmount.toLocaleString()} บาท)`,
          commissionAmount,
          transaction,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown escrow action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Escrow route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Escrow calculation failed' },
      { status: 500 }
    );
  }
}
