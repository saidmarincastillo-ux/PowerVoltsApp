using Microsoft.EntityFrameworkCore;
using PowerVolts.Server.Models;

namespace PowerVolts.Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<AppConfig> AppConfigs => Set<AppConfig>();
    public DbSet<TariffConfig> TariffConfigs => Set<TariffConfig>();
    public DbSet<TariffTierBlock> TariffTierBlocks => Set<TariffTierBlock>();
    public DbSet<MeterReading> MeterReadings => Set<MeterReading>();
    public DbSet<Appliance> Appliances => Set<Appliance>();
    public DbSet<SavingPlan> SavingPlans => Set<SavingPlan>();
    public DbSet<SavingPlanItem> SavingPlanItems => Set<SavingPlanItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TariffConfig>()
            .HasMany(t => t.TierBlocks)
            .WithOne()
            .HasForeignKey(b => b.TariffConfigId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SavingPlan>()
            .HasMany(p => p.Items)
            .WithOne()
            .HasForeignKey(i => i.SavingPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SavingPlanItem>()
            .HasOne(i => i.Appliance)
            .WithMany()
            .HasForeignKey(i => i.ApplianceId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
