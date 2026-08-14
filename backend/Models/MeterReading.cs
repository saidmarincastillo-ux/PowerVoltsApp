namespace PowerVolts.Server.Models;

public class MeterReading
{
    public int Id { get; set; }
    public DateTime ReadingDate { get; set; } = DateTime.UtcNow;
    public decimal ReadingPrevious { get; set; }
    public decimal ReadingCurrent { get; set; }
    public decimal DeltaNetConsumption { get; set; }
    public decimal SnapshotCalculatedCostNio { get; set; }
    public decimal SnapshotCalculatedCostUsd { get; set; }
    public bool HadRollover { get; set; }
    public bool IsOverSubsidyThreshold { get; set; }
    public decimal ProjectedMonthlyKwh { get; set; }
    public decimal ProjectedMonthlyCostNio { get; set; }
    public string Notes { get; set; } = string.Empty;
    public int AppliedTariffConfigId { get; set; }
}
