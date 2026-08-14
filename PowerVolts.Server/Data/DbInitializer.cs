using Microsoft.EntityFrameworkCore;
using PowerVolts.Server.Models;

namespace PowerVolts.Server.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        context.Database.EnsureCreated();

        // 1. AppConfig
        if (!context.AppConfigs.Any())
        {
            context.AppConfigs.Add(new AppConfig
            {
                Id = 1,
                DefaultCurrency = "NIO",
                ExchangeRateNioToUsd = 36.70m,
                MeterMaxDigits = 5,
                EnableSubsidyAlerts = true,
                SocialTariffThresholdKwh = 150.0m
            });
            context.SaveChanges();
        }

        // 2. TariffConfig & Blocks (DISNORTE-DISSUR / INE Nicaragua)
        if (!context.TariffConfigs.Any())
        {
            var tariff = new TariffConfig
            {
                Name = "Tarifa Domiciliaria T-0 (Nicaragua INE)",
                Description = "Pliego oficial DISNORTE-DISSUR con subsidio escalonado de Tarifa Social hasta 150 kWh/mes",
                BasePricePerKwh = 6.45m,
                FixedCommercialCharge = 45.50m,
                PublicLightingTaxPercentage = 8.5m,
                NonSubsidizedExtraRate = 9.80m,
                IsActive = true,
                DateEffective = DateTime.UtcNow,
                TierBlocks = new List<TariffTierBlock>
                {
                    new()
                    {
                        TierName = "Bloque 1: 0 - 50 kWh (Subsidio 50%)",
                        RangeMinKwh = 0m,
                        RangeMaxKwh = 50m,
                        SpecificPricePerKwh = 6.45m,
                        SubsidyPercentage = 50m
                    },
                    new()
                    {
                        TierName = "Bloque 2: 51 - 100 kWh (Subsidio 45%)",
                        RangeMinKwh = 50m,
                        RangeMaxKwh = 100m,
                        SpecificPricePerKwh = 6.45m,
                        SubsidyPercentage = 45m
                    },
                    new()
                    {
                        TierName = "Bloque 3: 101 - 150 kWh (Subsidio 25%)",
                        RangeMinKwh = 100m,
                        RangeMaxKwh = 150m,
                        SpecificPricePerKwh = 6.45m,
                        SubsidyPercentage = 25m
                    }
                }
            };
            context.TariffConfigs.Add(tariff);
            context.SaveChanges();
        }

        // 3. Appliances Catalog
        if (!context.Appliances.Any())
        {
            var appliances = new List<Appliance>
            {
                new()
                {
                    Name = "Refrigerador (12-14 pies³)",
                    Category = "Refrigeración",
                    DefaultWatts = 250,
                    DefaultDailyHours = 10.0m, // Ciclo compresor activo
                    Icon = "snowflake",
                    EfficiencyTip = "Asegúrate de que los sellos de goma cierren herméticamente y evita abrirlo innecesariamente.",
                    IsHighConsumption = true
                },
                new()
                {
                    Name = "Aire Acondicionado 12,000 BTU Inverter",
                    Category = "Climatización",
                    DefaultWatts = 1000,
                    DefaultDailyHours = 6.0m,
                    Icon = "wind",
                    EfficiencyTip = "Mantén la temperatura en 24°C y limpia los filtros cada 15 días para reducir hasta 20% el consumo.",
                    IsHighConsumption = true
                },
                new()
                {
                    Name = "Aire Acondicionado Convencional",
                    Category = "Climatización",
                    DefaultWatts = 1400,
                    DefaultDailyHours = 6.0m,
                    Icon = "wind",
                    EfficiencyTip = "Los equipos no inverter tienen picos altos de arranque. Programa un temporizador nocturno.",
                    IsHighConsumption = true
                },
                new()
                {
                    Name = "Abanico de Pedestal / Mesa",
                    Category = "Ventilación",
                    DefaultWatts = 65,
                    DefaultDailyHours = 8.0m,
                    Icon = "fan",
                    EfficiencyTip = "Consume una fracción del A/C; apágalo al salir de la habitación.",
                    IsHighConsumption = false
                },
                new()
                {
                    Name = "Smart TV LED 43-50 pulgadas",
                    Category = "Entretenimiento",
                    DefaultWatts = 75,
                    DefaultDailyHours = 5.0m,
                    Icon = "tv",
                    EfficiencyTip = "Desactiva el modo 'Standby rápido' para evitar consumos fantasma cuando no esté en uso.",
                    IsHighConsumption = false
                },
                new()
                {
                    Name = "Plancha de Ropa",
                    Category = "Línea Blanca",
                    DefaultWatts = 1200,
                    DefaultDailyHours = 0.5m,
                    Icon = "shirt",
                    EfficiencyTip = "Plancha la mayor cantidad de ropa en una sola sesión para aprovechar el calentamiento inicial.",
                    IsHighConsumption = true
                },
                new()
                {
                    Name = "Lavadora Automática",
                    Category = "Línea Blanca",
                    DefaultWatts = 500,
                    DefaultDailyHours = 1.0m,
                    Icon = "washing-machine",
                    EfficiencyTip = "Utiliza siempre cargas completas de ropa y agua a temperatura ambiente.",
                    IsHighConsumption = false
                },
                new()
                {
                    Name = "Horno Microondas",
                    Category = "Cocina",
                    DefaultWatts = 1100,
                    DefaultDailyHours = 0.25m,
                    Icon = "microwave",
                    EfficiencyTip = "Úsalo solo para recalentar o cocciones rápidas; desconéctalo para evitar luz de reloj constante.",
                    IsHighConsumption = true
                },
                new()
                {
                    Name = "Bombillo LED (9W)",
                    Category = "Iluminación",
                    DefaultWatts = 9,
                    DefaultDailyHours = 5.0m,
                    Icon = "lightbulb",
                    EfficiencyTip = "Ahorra hasta 85% comparado con bombillos tradicionales incandescentes de 60W.",
                    IsHighConsumption = false
                },
                new()
                {
                    Name = "Bomba de Agua (0.5 HP)",
                    Category = "Servicios",
                    DefaultWatts = 375,
                    DefaultDailyHours = 1.0m,
                    Icon = "droplets",
                    EfficiencyTip = "Revisa fugas en llantas e inodoros para evitar que la bomba encienda automáticamente sin motivo.",
                    IsHighConsumption = false
                },
                new()
                {
                    Name = "Computadora Portátil / Laptop",
                    Category = "Trabajo",
                    DefaultWatts = 65,
                    DefaultDailyHours = 6.0m,
                    Icon = "laptop",
                    EfficiencyTip = "Activa el modo de ahorro de energía y suspende la pantalla tras 5 minutos de inactividad.",
                    IsHighConsumption = false
                }
            };
            context.Appliances.AddRange(appliances);
            context.SaveChanges();
        }

        // 4. Default Saving Plan (Familiar)
        if (!context.SavingPlans.Any())
        {
            var plan = new SavingPlan
            {
                PlanName = "Plan Eficiencia Familiar (Meta 135 kWh)",
                Description = "Plan optimizado para mantenerse seguro bajo el subsidio de 150 kWh/mes",
                TargetKwhLimit = 135.0m,
                TargetBudgetCordobas = 480.0m,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            context.SavingPlans.Add(plan);
            context.SaveChanges();

            var refri = context.Appliances.FirstOrDefault(a => a.Name.Contains("Refrigerador"));
            var abanico = context.Appliances.FirstOrDefault(a => a.Name.Contains("Abanico"));
            var tv = context.Appliances.FirstOrDefault(a => a.Name.Contains("Smart TV"));
            var leds = context.Appliances.FirstOrDefault(a => a.Name.Contains("LED"));
            var plancha = context.Appliances.FirstOrDefault(a => a.Name.Contains("Plancha"));

            var items = new List<SavingPlanItem>
            {
                new()
                {
                    SavingPlanId = plan.Id,
                    ApplianceId = refri?.Id,
                    CustomName = "Refrigeradora Mabe 14 cuft",
                    Category = "Refrigeración",
                    Quantity = 1,
                    Watts = 220,
                    HoursPerDay = 10.0m,
                    DaysPerWeek = 7,
                    MonthlyKwh = 66.0m,
                    MonthlyCostNio = 220.0m,
                    MonthlyCostUsd = 6.00m,
                    ScheduleTimeRange = "24 horas (ciclo automático)",
                    Notes = "Mantener en nivel medio de frío"
                },
                new()
                {
                    SavingPlanId = plan.Id,
                    ApplianceId = abanico?.Id,
                    CustomName = "Abanicos Cuartos y Sala",
                    Category = "Ventilación",
                    Quantity = 2,
                    Watts = 65,
                    HoursPerDay = 7.0m,
                    DaysPerWeek = 7,
                    MonthlyKwh = 27.3m,
                    MonthlyCostNio = 95.0m,
                    MonthlyCostUsd = 2.59m,
                    ScheduleTimeRange = "13:00 - 15:00 / 22:00 - 03:00",
                    Notes = "Apagar al salir"
                },
                new()
                {
                    SavingPlanId = plan.Id,
                    ApplianceId = tv?.Id,
                    CustomName = "Smart TV Sala",
                    Category = "Entretenimiento",
                    Quantity = 1,
                    Watts = 70,
                    HoursPerDay = 4.0m,
                    DaysPerWeek = 7,
                    MonthlyKwh = 8.4m,
                    MonthlyCostNio = 29.0m,
                    MonthlyCostUsd = 0.79m,
                    ScheduleTimeRange = "19:00 - 23:00",
                    Notes = "Ver noticias y películas"
                },
                new()
                {
                    SavingPlanId = plan.Id,
                    ApplianceId = leds?.Id,
                    CustomName = "Bombillos LED Casa",
                    Category = "Iluminación",
                    Quantity = 6,
                    Watts = 9,
                    HoursPerDay = 5.0m,
                    DaysPerWeek = 7,
                    MonthlyKwh = 8.1m,
                    MonthlyCostNio = 28.0m,
                    MonthlyCostUsd = 0.76m,
                    ScheduleTimeRange = "18:00 - 23:00",
                    Notes = "Toda la casa con iluminación LED"
                },
                new()
                {
                    SavingPlanId = plan.Id,
                    ApplianceId = plancha?.Id,
                    CustomName = "Planchado Semanal",
                    Category = "Línea Blanca",
                    Quantity = 1,
                    Watts = 1200,
                    HoursPerDay = 1.0m,
                    DaysPerWeek = 2,
                    MonthlyKwh = 10.4m,
                    MonthlyCostNio = 36.0m,
                    MonthlyCostUsd = 0.98m,
                    ScheduleTimeRange = "Sábados y Domingos 08:00 - 09:00",
                    Notes = "Una sola sesión para ahorrar"
                }
            };

            context.SavingPlanItems.AddRange(items);
            context.SaveChanges();
        }

        // 5. Initial Sample Readings for History
        if (!context.MeterReadings.Any())
        {
            var now = DateTime.UtcNow;
            context.MeterReadings.AddRange(
                new MeterReading
                {
                    ReadingDate = now.AddDays(-60),
                    ReadingPrevious = 12450m,
                    ReadingCurrent = 12585m,
                    DeltaNetConsumption = 135m,
                    SnapshotCalculatedCostNio = 469.50m,
                    SnapshotCalculatedCostUsd = 12.79m,
                    HadRollover = false,
                    IsOverSubsidyThreshold = false,
                    ProjectedMonthlyKwh = 135m,
                    ProjectedMonthlyCostNio = 469.50m,
                    Notes = "Consumo normal con subsidio",
                    AppliedTariffConfigId = 1
                },
                new MeterReading
                {
                    ReadingDate = now.AddDays(-30),
                    ReadingPrevious = 12585m,
                    ReadingCurrent = 12727m,
                    DeltaNetConsumption = 142m,
                    SnapshotCalculatedCostNio = 503.20m,
                    SnapshotCalculatedCostUsd = 13.71m,
                    HadRollover = false,
                    IsOverSubsidyThreshold = false,
                    ProjectedMonthlyKwh = 142m,
                    ProjectedMonthlyCostNio = 503.20m,
                    Notes = "Mes caluroso, cerca de los 150 kWh",
                    AppliedTariffConfigId = 1
                },
                new MeterReading
                {
                    ReadingDate = now.AddDays(-5),
                    ReadingPrevious = 12727m,
                    ReadingCurrent = 12852m,
                    DeltaNetConsumption = 125m,
                    SnapshotCalculatedCostNio = 422.30m,
                    SnapshotCalculatedCostUsd = 11.51m,
                    HadRollover = false,
                    IsOverSubsidyThreshold = false,
                    ProjectedMonthlyKwh = 130m,
                    ProjectedMonthlyCostNio = 445.00m,
                    Notes = "Monitoreo preventivo del ciclo",
                    AppliedTariffConfigId = 1
                }
            );
            context.SaveChanges();
        }
    }
}
