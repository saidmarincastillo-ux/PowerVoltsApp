namespace PowerVolts.Server.Models;

public class TariffTierBlock
{
    public int Id { get; set; }
    public int TariffConfigId { get; set; }
    public string TierName { get; set; } = string.Empty;
    public decimal RangeMinKwh { get; set; }
    public decimal RangeMaxKwh { get; set; }
    public decimal SpecificPricePerKwh { get; set; } // Specific base or override price
    public decimal SubsidyPercentage { get; set; } // e.g., 50 for 50%, 45 for 45%, 25 for 25%
}
