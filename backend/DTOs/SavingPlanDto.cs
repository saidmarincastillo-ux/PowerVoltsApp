namespace PowerVolts.Server.DTOs;

public class SavingPlanItemDto
{
    public int Id { get; set; }
    public int SavingPlanId { get; set; }
    public int? ApplianceId { get; set; }
    public string CustomName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public int Watts { get; set; }
    public decimal HoursPerDay { get; set; }
    public int DaysPerWeek { get; set; } = 7;
    public decimal MonthlyKwh { get; set; }
    public decimal MonthlyCostNio { get; set; }
    public decimal MonthlyCostUsd { get; set; }
    public decimal PercentageOfTotalPlan { get; set; }
    public string ScheduleTimeRange { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string Icon { get; set; } = "zap";
    public string EfficiencyTip { get; set; } = string.Empty;
}

public class SavingPlanSummaryDto
{
    public int Id { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal TargetKwhLimit { get; set; }
    public decimal TargetBudgetCordobas { get; set; }
    public decimal TotalCalculatedKwh { get; set; }
    public decimal TotalCalculatedCostNio { get; set; }
    public decimal TotalCalculatedCostUsd { get; set; }
    public bool IsUnderLimit { get; set; }
    public decimal RemainingKwhMargin { get; set; }
    public decimal RemainingBudgetMarginNio { get; set; }
    public int TotalApplianceCount { get; set; }
    public List<SavingPlanItemDto> Items { get; set; } = new();
    public List<SavingRecommendationDto> Recommendations { get; set; } = new();
}

public class SavingRecommendationDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PotentialKwhSaved { get; set; }
    public decimal PotentialCordobasSaved { get; set; }
    public string ImpactLevel { get; set; } = "Alta"; // Alta, Media, Informativa
    public string ApplianceName { get; set; } = string.Empty;
}

public class SavingSimulationRequest
{
    public int SavingPlanItemId { get; set; }
    public decimal NewHoursPerDay { get; set; }
    public int NewDaysPerWeek { get; set; }
}

public class SavingSimulationResult
{
    public string ApplianceName { get; set; } = string.Empty;
    public decimal OriginalMonthlyKwh { get; set; }
    public decimal NewMonthlyKwh { get; set; }
    public decimal SavedKwh { get; set; }
    public decimal OriginalCostNio { get; set; }
    public decimal NewCostNio { get; set; }
    public decimal SavedCostNio { get; set; }
    public decimal SavedCostUsd { get; set; }
    public bool ProtectsSocialTariff { get; set; }
    public string Advice { get; set; } = string.Empty;
}
