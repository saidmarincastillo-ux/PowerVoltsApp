namespace PowerVolts.Server.Models;

public class SavingPlan
{
    public int Id { get; set; }
    public string PlanName { get; set; } = "Plan de Ahorro Familiar (Meta 150 kWh)";
    public string Description { get; set; } = "Presupuesto para conservar la Tarifa Social subsidiada de Nicaragua";
    public decimal TargetKwhLimit { get; set; } = 150.0m;
    public decimal TargetBudgetCordobas { get; set; } = 500.0m;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public List<SavingPlanItem> Items { get; set; } = new();
}
