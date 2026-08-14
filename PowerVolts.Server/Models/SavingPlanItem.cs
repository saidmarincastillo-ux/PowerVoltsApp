namespace PowerVolts.Server.Models;

public class SavingPlanItem
{
    public int Id { get; set; }
    public int SavingPlanId { get; set; }
    public int? ApplianceId { get; set; }
    public string CustomName { get; set; } = string.Empty;
    public string Category { get; set; } = "General";
    public int Quantity { get; set; } = 1;
    public int Watts { get; set; } = 100;
    public decimal HoursPerDay { get; set; } = 4.0m;
    public int DaysPerWeek { get; set; } = 7;
    public decimal MonthlyKwh { get; set; }
    public decimal MonthlyCostNio { get; set; }
    public decimal MonthlyCostUsd { get; set; }
    public string ScheduleTimeRange { get; set; } = "Ej: 19:00 - 22:00";
    public string Notes { get; set; } = string.Empty;

    public Appliance? Appliance { get; set; }
}
