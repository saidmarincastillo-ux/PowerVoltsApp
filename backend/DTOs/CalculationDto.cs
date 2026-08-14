namespace PowerVolts.Server.DTOs;

public class CalculationRequest
{
    public decimal ReadingPrevious { get; set; }
    public decimal ReadingCurrent { get; set; }
    public int? MeterMaxDigits { get; set; } // 5 or 6
    public int DaysBetweenReadings { get; set; } = 30;
    public string? Notes { get; set; }
    public bool SaveToHistory { get; set; } = true;
}

public class TierBreakdownItem
{
    public string TierName { get; set; } = string.Empty;
    public decimal KwhInTier { get; set; }
    public decimal RatePerKwh { get; set; }
    public decimal SubsidyPercentage { get; set; }
    public decimal SubtotalBeforeSubsidyNio { get; set; }
    public decimal SubsidyDiscountNio { get; set; }
    public decimal SubtotalNio { get; set; }
}

public class CalculationResponse
{
    public decimal NetConsumptionKwh { get; set; }
    public decimal CalculatedCostNio { get; set; }
    public decimal CalculatedCostUsd { get; set; }
    public bool HadRollover { get; set; }
    public decimal RolloverOffsetApplied { get; set; }
    public bool IsEligibleForSocialTariff { get; set; }
    public bool SubsidyLossWarning { get; set; }
    public decimal SubsidySavedAmountNio { get; set; }
    public decimal FixedCommercialChargeNio { get; set; }
    public decimal PublicLightingTaxNio { get; set; }
    public decimal EnergyCostOnlyNio { get; set; }
    public decimal ProjectedMonthlyKwh { get; set; }
    public decimal ProjectedMonthlyCostNio { get; set; }
    public decimal ProjectedMonthlyCostUsd { get; set; }
    public string StatusMessage { get; set; } = string.Empty;
    public List<TierBreakdownItem> Breakdown { get; set; } = new();
    public int? SavedReadingId { get; set; }
}
