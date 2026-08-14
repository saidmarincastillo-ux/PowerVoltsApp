namespace PowerVolts.Server.Models;

public class TariffConfig
{
    public int Id { get; set; }
    public string Name { get; set; } = "Tarifa Domiciliaria T-0 (Nicaragua INE)";
    public string Description { get; set; } = "Pliego tarifario residencial DISNORTE-DISSUR con subsidio de Tarifa Social";
    public decimal BasePricePerKwh { get; set; } = 6.45m; // Base price in C$ (approx $0.176 USD)
    public decimal FixedCommercialCharge { get; set; } = 45.50m; // Cargo fijo en C$
    public decimal PublicLightingTaxPercentage { get; set; } = 8.5m; // % Alumbrado público
    public decimal NonSubsidizedExtraRate { get; set; } = 9.80m; // Rate per kWh when exceeding 150 kWh
    public bool IsActive { get; set; } = true;
    public DateTime DateEffective { get; set; } = DateTime.UtcNow;

    public List<TariffTierBlock> TierBlocks { get; set; } = new();
}
