import { TIER_LIMITS, TIER_NAMES, DataTier } from "@shared/schema";

export function getTierName(tier: number): string {
  return TIER_NAMES[tier as DataTier] || "Unknown";
}

export function getTierLimits(tier: number) {
  return TIER_LIMITS[tier as DataTier] || TIER_LIMITS[DataTier.FREEMIUM];
}

export function canCreateDeck(currentDeckCount: number, tier: number): boolean {
  const limits = getTierLimits(tier);
  return limits.maxDecks === -1 || currentDeckCount < limits.maxDecks;
}

export function canAddStock(currentStockCount: number, tier: number): boolean {
  const limits = getTierLimits(tier);
  return limits.maxStocksPerDeck === -1 || currentStockCount < limits.maxStocksPerDeck;
}

export function getTierColor(tier: number): string {
  switch (tier) {
    case DataTier.FREEMIUM:
      return "bg-slate-500";
    case DataTier.MARKET_HOURS_PRO:
      return "bg-orange-500";
    case DataTier.SECTOR_SPECIALIST:
      return "bg-blue-500";
    case DataTier.WEEKEND_WARRIOR:
      return "bg-purple-500";
    case DataTier.DARK_POOL_INSIDER:
      return "bg-red-500";
    case DataTier.ALGORITHMIC_TRADER:
      return "bg-green-500";
    case DataTier.INSTITUTIONAL_ELITE:
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
}
