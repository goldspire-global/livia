export type ChainPulseStatus = "ok" | "watch" | "act";

export type ChainShopRollup = {
  businessId: string;
  name: string;
  slug: string;
  planId: string | null;
  tier: string;
  city: string | null;
  bookingsThisWeek: number;
  completedThisWeek: number;
  todayBookings: number;
  pendingBookings: number;
  openConversations: number;
  handedOffConversations: number;
  pendingTimeOff: number;
  pulseStatus: ChainPulseStatus;
  pulseReason: string | null;
};

export type ChainAlert = {
  businessId: string;
  shopName: string;
  severity: "watch" | "act";
  code: string;
  message: string;
};

export type ChainCommerceAlert = {
  businessId: string;
  shopName: string;
  severity: "act" | "watch";
  code: string;
  message: string;
  href: string;
};

export type ChainShopCommerceSlice = {
  businessId: string;
  shopName: string;
  capturedMinor30d: number;
  capturedLabel: string;
  captureRatePercent: number | null;
  paymentCount30d: number;
  demandBookings: number;
  topSignal?: {
    id: string;
    title: string;
    severity: string;
    href: string;
  } | null;
};

export type ChainRollup = {
  shopCount: number;
  bookingsThisWeek: number;
  completedThisWeek: number;
  shopsNeedingAttention: number;
  orgAdminBriefingLine: string;
  alerts?: ChainAlert[];
  commerceAlerts?: ChainCommerceAlert[];
  commerceSummary?: {
    totalCapturedMinor30d: number;
    shopsWithActSignal: number;
    shopsWithWatchSignal: number;
  };
  commerceByShop?: ChainShopCommerceSlice[];
  shops: ChainShopRollup[];
};
