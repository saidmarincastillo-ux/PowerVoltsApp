using PowerVolts.Server.DTOs;
using PowerVolts.Server.Models;

namespace PowerVolts.Server.Services;

public class EnergySavingService
{
    private readonly TariffCalculationEngine _calcEngine;

    public EnergySavingService(TariffCalculationEngine calcEngine)
    {
        _calcEngine = calcEngine;
    }

    public decimal CalculateItemMonthlyKwh(int watts, decimal hoursPerDay, int daysPerWeek, int quantity)
    {
        if (watts <= 0 || hoursPerDay <= 0 || daysPerWeek <= 0 || quantity <= 0)
            return 0m;

        // Weeks per month average ~ 4.33
        decimal weeklyHours = hoursPerDay * daysPerWeek;
        decimal monthlyHours = weeklyHours * 4.3333m;
        decimal totalWatts = (decimal)watts * quantity;
        decimal monthlyKwh = (totalWatts * monthlyHours) / 1000m;

        return Math.Round(monthlyKwh, 2);
    }

    public SavingPlanSummaryDto BuildPlanSummary(SavingPlan plan, TariffConfig tariff, AppConfig config)
    {
        decimal exchangeRate = config.ExchangeRateNioToUsd > 0 ? config.ExchangeRateNioToUsd : 36.70m;
        decimal threshold = config.SocialTariffThresholdKwh > 0 ? config.SocialTariffThresholdKwh : 150.0m;

        decimal totalKwh = 0m;
        var itemDtos = new List<SavingPlanItemDto>();

        foreach (var item in plan.Items)
        {
            decimal itemKwh = CalculateItemMonthlyKwh(item.Watts, item.HoursPerDay, item.DaysPerWeek, item.Quantity);
            item.MonthlyKwh = itemKwh;
            totalKwh += itemKwh;
        }

        // Calculate cost per item proportional to total energy calculation
        var billCalc = _calcEngine.CalculateBill(0, totalKwh, tariff, config, 30);
        decimal effectivePricePerKwh = totalKwh > 0 ? billCalc.CalculatedCostNio / totalKwh : tariff.BasePricePerKwh;

        foreach (var item in plan.Items)
        {
            decimal costNio = Math.Round(item.MonthlyKwh * effectivePricePerKwh, 2);
            decimal costUsd = Math.Round(costNio / exchangeRate, 2);
            item.MonthlyCostNio = costNio;
            item.MonthlyCostUsd = costUsd;

            decimal percentage = totalKwh > 0 ? Math.Round((item.MonthlyKwh / totalKwh) * 100m, 1) : 0m;

            itemDtos.Add(new SavingPlanItemDto
            {
                Id = item.Id,
                SavingPlanId = item.SavingPlanId,
                ApplianceId = item.ApplianceId,
                CustomName = item.CustomName,
                Category = item.Category,
                Quantity = item.Quantity,
                Watts = item.Watts,
                HoursPerDay = item.HoursPerDay,
                DaysPerWeek = item.DaysPerWeek,
                MonthlyKwh = item.MonthlyKwh,
                MonthlyCostNio = costNio,
                MonthlyCostUsd = costUsd,
                PercentageOfTotalPlan = percentage,
                ScheduleTimeRange = item.ScheduleTimeRange,
                Notes = item.Notes,
                Icon = item.Appliance?.Icon ?? "zap",
                EfficiencyTip = item.Appliance?.EfficiencyTip ?? "Usa este equipo con moderación en horarios no punta."
            });
        }

        var recommendations = GenerateRecommendations(plan.Items.ToList(), totalKwh, threshold, tariff, exchangeRate);

        return new SavingPlanSummaryDto
        {
            Id = plan.Id,
            PlanName = plan.PlanName,
            Description = plan.Description,
            TargetKwhLimit = plan.TargetKwhLimit,
            TargetBudgetCordobas = plan.TargetBudgetCordobas,
            TotalCalculatedKwh = Math.Round(totalKwh, 2),
            TotalCalculatedCostNio = billCalc.CalculatedCostNio,
            TotalCalculatedCostUsd = billCalc.CalculatedCostUsd,
            IsUnderLimit = totalKwh <= plan.TargetKwhLimit,
            RemainingKwhMargin = Math.Round(plan.TargetKwhLimit - totalKwh, 2),
            RemainingBudgetMarginNio = Math.Round(plan.TargetBudgetCordobas - billCalc.CalculatedCostNio, 2),
            TotalApplianceCount = plan.Items.Sum(i => i.Quantity),
            Items = itemDtos.OrderByDescending(i => i.MonthlyKwh).ToList(),
            Recommendations = recommendations
        };
    }

    public List<SavingRecommendationDto> GenerateRecommendations(
        List<SavingPlanItem> items,
        decimal totalKwh,
        decimal threshold,
        TariffConfig tariff,
        decimal exchangeRate)
    {
        var list = new List<SavingRecommendationDto>();

        // 1. Check if total is over or near 150 kWh
        if (totalKwh > threshold)
        {
            decimal excessKwh = totalKwh - threshold;
            list.Add(new SavingRecommendationDto
            {
                Title = "🚨 ¡Alerta Crítica! Pérdida de Tarifa Social",
                Description = $"Tu plan actual suma {totalKwh:N1} kWh ({excessKwh:N1} kWh sobre el límite). Reducir tiempos en los equipos principales te permitirá recuperar el 40%-50% de subsidio.",
                ImpactLevel = "Alta",
                PotentialKwhSaved = excessKwh,
                PotentialCordobasSaved = Math.Round(excessKwh * tariff.NonSubsidizedExtraRate + tariff.FixedCommercialCharge, 2),
                ApplianceName = "General"
            });
        }

        // 2. Heavy consumers (A/C, Planchas, etc.)
        var acItems = items.Where(i => i.CustomName.Contains("Aire", StringComparison.OrdinalIgnoreCase) ||
                                       i.Category.Contains("Climatiz", StringComparison.OrdinalIgnoreCase) ||
                                       i.Watts >= 1000).ToList();

        foreach (var ac in acItems)
        {
            if (ac.HoursPerDay > 4)
            {
                decimal reducedHours = Math.Max(2, ac.HoursPerDay - 2);
                decimal currentKwh = CalculateItemMonthlyKwh(ac.Watts, ac.HoursPerDay, ac.DaysPerWeek, ac.Quantity);
                decimal simulatedKwh = CalculateItemMonthlyKwh(ac.Watts, reducedHours, ac.DaysPerWeek, ac.Quantity);
                decimal kwhSaved = currentKwh - simulatedKwh;
                decimal moneySaved = Math.Round(kwhSaved * tariff.BasePricePerKwh, 2);

                list.Add(new SavingRecommendationDto
                {
                    Title = $"❄️ Optimización en '{ac.CustomName}'",
                    Description = $"Si reduces de {ac.HoursPerDay:N0}h a {reducedHours:N0}h diarias (usando temporizador nocturno o subiendo el termostato a 24°C), ahorrarás {kwhSaved:N1} kWh/mes.",
                    ImpactLevel = "Alta",
                    PotentialKwhSaved = Math.Round(kwhSaved, 2),
                    PotentialCordobasSaved = moneySaved,
                    ApplianceName = ac.CustomName
                });
            }
        }

        // 3. Lighting check
        var incandescents = items.Where(i => i.CustomName.Contains("Incandescente", StringComparison.OrdinalIgnoreCase) ||
                                             (i.Category == "Iluminación" && i.Watts >= 40)).ToList();
        foreach (var inc in incandescents)
        {
            decimal currentKwh = CalculateItemMonthlyKwh(inc.Watts, inc.HoursPerDay, inc.DaysPerWeek, inc.Quantity);
            decimal ledKwh = CalculateItemMonthlyKwh(9, inc.HoursPerDay, inc.DaysPerWeek, inc.Quantity);
            decimal kwhSaved = currentKwh - ledKwh;
            decimal moneySaved = Math.Round(kwhSaved * tariff.BasePricePerKwh, 2);

            list.Add(new SavingRecommendationDto
            {
                Title = $"💡 Reemplazo a Bombillos LED en '{inc.CustomName}'",
                Description = $"Cambiar bombillos incandescentes ({inc.Watts}W) por bombillos LED de 9W te ahorrará {kwhSaved:N1} kWh/mes manteniendo la misma iluminación.",
                ImpactLevel = "Media",
                PotentialKwhSaved = Math.Round(kwhSaved, 2),
                PotentialCordobasSaved = moneySaved,
                ApplianceName = inc.CustomName
            });
        }

        // 4. General tip
        list.Add(new SavingRecommendationDto
        {
            Title = "🔌 Eliminar Cargas Fantasma (Vampiros Eléctricos)",
            Description = "Desconecta cargadores, microondas y televisores cuando salgas de casa o vayas a dormir para ahorrar entre 5 y 10 kWh al mes.",
            ImpactLevel = "Informativa",
            PotentialKwhSaved = 8.0m,
            PotentialCordobasSaved = Math.Round(8.0m * tariff.BasePricePerKwh, 2),
            ApplianceName = "Cargas Fantasma"
        });

        return list;
    }

    public SavingSimulationResult SimulateReduction(
        SavingPlanItem item,
        decimal newHoursPerDay,
        int newDaysPerWeek,
        TariffConfig tariff,
        AppConfig config)
    {
        decimal origKwh = CalculateItemMonthlyKwh(item.Watts, item.HoursPerDay, item.DaysPerWeek, item.Quantity);
        decimal newKwh = CalculateItemMonthlyKwh(item.Watts, newHoursPerDay, newDaysPerWeek, item.Quantity);
        decimal savedKwh = Math.Max(0, origKwh - newKwh);

        decimal rate = tariff.BasePricePerKwh > 0 ? tariff.BasePricePerKwh : 6.45m;
        decimal savedCostNio = Math.Round(savedKwh * rate, 2);
        decimal exchangeRate = config.ExchangeRateNioToUsd > 0 ? config.ExchangeRateNioToUsd : 36.70m;
        decimal savedCostUsd = Math.Round(savedCostNio / exchangeRate, 2);

        return new SavingSimulationResult
        {
            ApplianceName = item.CustomName,
            OriginalMonthlyKwh = origKwh,
            NewMonthlyKwh = newKwh,
            SavedKwh = savedKwh,
            OriginalCostNio = Math.Round(origKwh * rate, 2),
            NewCostNio = Math.Round(newKwh * rate, 2),
            SavedCostNio = savedCostNio,
            SavedCostUsd = savedCostUsd,
            ProtectsSocialTariff = true,
            Advice = $"Al reducir a {newHoursPerDay} horas/día, evitas consumir {savedKwh:N1} kWh, ahorrando C$ {savedCostNio:N2} mensuales."
        };
    }
}
