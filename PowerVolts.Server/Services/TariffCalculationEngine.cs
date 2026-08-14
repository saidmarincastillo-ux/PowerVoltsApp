using PowerVolts.Server.DTOs;
using PowerVolts.Server.Models;

namespace PowerVolts.Server.Services;

public class TariffCalculationEngine
{
    public (decimal netKwh, bool hadRollover, decimal rolloverOffset) CalculateNetConsumption(
        decimal previous,
        decimal current,
        int meterDigits = 5)
    {
        decimal rawDiff = current - previous;
        if (rawDiff >= 0)
        {
            return (rawDiff, false, 0m);
        }

        // Rollover detected
        decimal maxCapacity = (decimal)Math.Pow(10, meterDigits);
        decimal correctedKwh = (maxCapacity - previous) + current;
        return (correctedKwh, true, maxCapacity);
    }

    public CalculationResponse CalculateBill(
        decimal readingPrevious,
        decimal readingCurrent,
        TariffConfig tariff,
        AppConfig config,
        int daysBetweenReadings = 30)
    {
        int digits = config.MeterMaxDigits <= 0 ? 5 : config.MeterMaxDigits;
        var (netKwh, hadRollover, offset) = CalculateNetConsumption(readingPrevious, readingCurrent, digits);

        var response = new CalculationResponse
        {
            NetConsumptionKwh = Math.Round(netKwh, 2),
            HadRollover = hadRollover,
            RolloverOffsetApplied = offset,
            Breakdown = new List<TierBreakdownItem>()
        };

        decimal threshold = config.SocialTariffThresholdKwh > 0 ? config.SocialTariffThresholdKwh : 150.0m;
        decimal exchangeRate = config.ExchangeRateNioToUsd > 0 ? config.ExchangeRateNioToUsd : 36.70m;

        // Projection for full 30-day month
        int days = daysBetweenReadings > 0 ? daysBetweenReadings : 30;
        decimal dailyAvgKwh = days > 0 ? netKwh / days : netKwh;
        decimal projected30DayKwh = Math.Round(dailyAvgKwh * 30m, 2);
        response.ProjectedMonthlyKwh = projected30DayKwh;

        bool isEligibleForSocial = netKwh <= threshold;
        response.IsEligibleForSocialTariff = isEligibleForSocial;

        decimal totalEnergyCostNio = 0m;
        decimal unsubsidizedHypotheticalCostNio = 0m;

        if (isEligibleForSocial)
        {
            // Tiered subsidized calculation
            response.StatusMessage = "¡Felicidades! Tu consumo está protegido por la Tarifa Social subsidiada (≤ 150 kWh).";
            response.SubsidyLossWarning = projected30DayKwh > threshold;

            decimal remainingKwh = netKwh;
            var orderedBlocks = tariff.TierBlocks.OrderBy(b => b.RangeMinKwh).ToList();

            if (orderedBlocks.Any())
            {
                foreach (var block in orderedBlocks)
                {
                    if (remainingKwh <= 0) break;

                    decimal blockCapacity = block.RangeMaxKwh - block.RangeMinKwh;
                    decimal kwhInBlock = Math.Min(remainingKwh, blockCapacity);
                    decimal basePrice = block.SpecificPricePerKwh > 0 ? block.SpecificPricePerKwh : tariff.BasePricePerKwh;
                    decimal discountPercent = block.SubsidyPercentage / 100m;

                    decimal beforeSubsidy = kwhInBlock * basePrice;
                    decimal discountAmount = beforeSubsidy * discountPercent;
                    decimal netBlockCost = beforeSubsidy - discountAmount;

                    totalEnergyCostNio += netBlockCost;
                    unsubsidizedHypotheticalCostNio += beforeSubsidy;
                    remainingKwh -= kwhInBlock;

                    response.Breakdown.Add(new TierBreakdownItem
                    {
                        TierName = block.TierName,
                        KwhInTier = Math.Round(kwhInBlock, 2),
                        RatePerKwh = basePrice,
                        SubsidyPercentage = block.SubsidyPercentage,
                        SubtotalBeforeSubsidyNio = Math.Round(beforeSubsidy, 2),
                        SubsidyDiscountNio = Math.Round(discountAmount, 2),
                        SubtotalNio = Math.Round(netBlockCost, 2)
                    });
                }
            }
            else
            {
                // Fallback default subsidised rate (avg 40% discount)
                decimal before = netKwh * tariff.BasePricePerKwh;
                decimal discount = before * 0.40m;
                totalEnergyCostNio = before - discount;
                unsubsidizedHypotheticalCostNio = before;
            }

            // Minimal lighting tax for social tier
            decimal lightingTax = Math.Round(totalEnergyCostNio * (tariff.PublicLightingTaxPercentage / 100m) * 0.5m, 2);
            response.PublicLightingTaxNio = lightingTax;
            response.FixedCommercialChargeNio = 0m; // Subsidized residential tariff exempt from heavy fixed charge
            response.EnergyCostOnlyNio = Math.Round(totalEnergyCostNio, 2);

            decimal finalCostNio = totalEnergyCostNio + lightingTax;
            response.CalculatedCostNio = Math.Round(finalCostNio, 2);
            response.CalculatedCostUsd = Math.Round(finalCostNio / exchangeRate, 2);
            response.SubsidySavedAmountNio = Math.Round(Math.Max(0, unsubsidizedHypotheticalCostNio - totalEnergyCostNio), 2);
        }
        else
        {
            // Exceeded 150 kWh: Full rate + Fixed Commercial Charge + Full Public Lighting Tax
            response.SubsidyLossWarning = true;
            response.StatusMessage = $"⚠️ ALERTA DE EXCESO: Has superado el umbral de 150 kWh ({netKwh:N1} kWh). Se aplica tarifa plena sin subsidio estatal y con cargos comerciales.";

            decimal fullRate = tariff.NonSubsidizedExtraRate > 0 ? tariff.NonSubsidizedExtraRate : 9.80m;
            decimal baseEnergyCost = netKwh * fullRate;
            decimal fixedCharge = tariff.FixedCommercialCharge > 0 ? tariff.FixedCommercialCharge : 45.50m;
            decimal lightingTax = baseEnergyCost * (tariff.PublicLightingTaxPercentage / 100m);

            totalEnergyCostNio = baseEnergyCost;
            response.EnergyCostOnlyNio = Math.Round(baseEnergyCost, 2);
            response.FixedCommercialChargeNio = Math.Round(fixedCharge, 2);
            response.PublicLightingTaxNio = Math.Round(lightingTax, 2);

            decimal finalCostNio = baseEnergyCost + fixedCharge + lightingTax;
            response.CalculatedCostNio = Math.Round(finalCostNio, 2);
            response.CalculatedCostUsd = Math.Round(finalCostNio / exchangeRate, 2);
            response.SubsidySavedAmountNio = 0m;

            response.Breakdown.Add(new TierBreakdownItem
            {
                TierName = "Consumo Pleno sin Subsidio (> 150 kWh)",
                KwhInTier = Math.Round(netKwh, 2),
                RatePerKwh = fullRate,
                SubsidyPercentage = 0m,
                SubtotalBeforeSubsidyNio = Math.Round(baseEnergyCost, 2),
                SubsidyDiscountNio = 0m,
                SubtotalNio = Math.Round(baseEnergyCost, 2)
            });
        }

        // Projected 30-day bill
        if (projected30DayKwh <= threshold)
        {
            response.ProjectedMonthlyCostNio = Math.Round((response.CalculatedCostNio / (netKwh > 0 ? netKwh : 1)) * projected30DayKwh, 2);
        }
        else
        {
            decimal fullRate = tariff.NonSubsidizedExtraRate > 0 ? tariff.NonSubsidizedExtraRate : 9.80m;
            decimal projEnergy = projected30DayKwh * fullRate;
            decimal projTotal = projEnergy + (tariff.FixedCommercialCharge) + (projEnergy * (tariff.PublicLightingTaxPercentage / 100m));
            response.ProjectedMonthlyCostNio = Math.Round(projTotal, 2);
        }
        response.ProjectedMonthlyCostUsd = Math.Round(response.ProjectedMonthlyCostNio / exchangeRate, 2);

        return response;
    }
}
