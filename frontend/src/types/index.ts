export interface AppConfig {
  id: number;
  defaultCurrency: string;
  exchangeRateNioToUsd: number;
  meterMaxDigits: number;
  enableSubsidyAlerts: boolean;
  socialTariffThresholdKwh: number;
}

export interface TariffTierBlock {
  id: number;
  tariffConfigId: number;
  tierName: string;
  rangeMinKwh: number;
  rangeMaxKwh: number;
  specificPricePerKwh: number;
  subsidyPercentage: number;
}

export interface TariffConfig {
  id: number;
  name: string;
  description: string;
  basePricePerKwh: number;
  fixedCommercialCharge: number;
  publicLightingTaxPercentage: number;
  nonSubsidizedExtraRate: number;
  isActive: boolean;
  dateEffective: string;
  tierBlocks: TariffTierBlock[];
}

export interface MeterReading {
  id: number;
  readingDate: string;
  readingPrevious: number;
  readingCurrent: number;
  deltaNetConsumption: number;
  snapshotCalculatedCostNio: number;
  snapshotCalculatedCostUsd: number;
  hadRollover: boolean;
  isOverSubsidyThreshold: boolean;
  projectedMonthlyKwh: number;
  projectedMonthlyCostNio: number;
  notes: string;
  appliedTariffConfigId: number;
}

export interface TierBreakdownItem {
  tierName: string;
  kwhInTier: number;
  ratePerKwh: number;
  subsidyPercentage: number;
  subtotalBeforeSubsidyNio: number;
  subsidyDiscountNio: number;
  subtotalNio: number;
}

export interface CalculationResponse {
  netConsumptionKwh: number;
  calculatedCostNio: number;
  calculatedCostUsd: number;
  hadRollover: boolean;
  rolloverOffsetApplied: number;
  isEligibleForSocialTariff: boolean;
  subsidyLossWarning: boolean;
  subsidySavedAmountNio: number;
  fixedCommercialChargeNio: number;
  publicLightingTaxNio: number;
  energyCostOnlyNio: number;
  projectedMonthlyKwh: number;
  projectedMonthlyCostNio: number;
  projectedMonthlyCostUsd: number;
  statusMessage: string;
  breakdown: TierBreakdownItem[];
  savedReadingId?: number;
}

export interface Appliance {
  id: number;
  name: string;
  category: string;
  defaultWatts: number;
  defaultDailyHours: number;
  icon: string;
  efficiencyTip: string;
  isHighConsumption: boolean;
}

export interface SavingPlanItem {
  id: number;
  savingPlanId: number;
  applianceId?: number;
  customName: string;
  category: string;
  quantity: number;
  watts: number;
  hoursPerDay: number;
  daysPerWeek: number;
  monthlyKwh: number;
  monthlyCostNio: number;
  monthlyCostUsd: number;
  percentageOfTotalPlan: number;
  scheduleTimeRange: string;
  notes: string;
  icon: string;
  efficiencyTip: string;
}

export interface SavingRecommendation {
  title: string;
  description: string;
  potentialKwhSaved: number;
  potentialCordobasSaved: number;
  impactLevel: string;
  applianceName: string;
}

export interface SavingPlanSummary {
  id: number;
  planName: string;
  description: string;
  targetKwhLimit: number;
  targetBudgetCordobas: number;
  totalCalculatedKwh: number;
  totalCalculatedCostNio: number;
  totalCalculatedCostUsd: number;
  isUnderLimit: boolean;
  remainingKwhMargin: number;
  remainingBudgetMarginNio: number;
  totalApplianceCount: number;
  items: SavingPlanItem[];
  recommendations: SavingRecommendation[];
}

export interface SavingSimulationResult {
  applianceName: string;
  originalMonthlyKwh: number;
  newMonthlyKwh: number;
  savedKwh: number;
  originalCostNio: number;
  newCostNio: number;
  savedCostNio: number;
  savedCostUsd: number;
  protectsSocialTariff: boolean;
  advice: string;
}
