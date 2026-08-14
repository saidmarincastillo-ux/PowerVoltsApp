namespace PowerVolts.Server.Models;

public class Appliance
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "Hogar"; // Climatización, Refrigeración, Iluminación, Línea Blanca, Entretenimiento
    public int DefaultWatts { get; set; }
    public decimal DefaultDailyHours { get; set; }
    public string Icon { get; set; } = "zap"; // Lucide icon name
    public string EfficiencyTip { get; set; } = string.Empty;
    public bool IsHighConsumption { get; set; } // Flag if it consumes > 500W
}
