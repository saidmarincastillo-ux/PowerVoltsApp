namespace PowerVolts.Server.Models;

public class AppConfig
{
    public int Id { get; set; } = 1;
    public string DefaultCurrency { get; set; } = "NIO"; // NIO (C$) or USD ($)
    public decimal ExchangeRateNioToUsd { get; set; } = 36.70m; // Córdobas per 1 USD
    public int MeterMaxDigits { get; set; } = 5; // 5 digits (99999) or 6 digits (999999)
    public bool EnableSubsidyAlerts { get; set; } = true;
    public decimal SocialTariffThresholdKwh { get; set; } = 150.0m; // Nicaragua 150 kWh threshold
}
