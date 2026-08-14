using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerVolts.Server.Data;
using PowerVolts.Server.DTOs;
using PowerVolts.Server.Models;
using PowerVolts.Server.Services;

namespace PowerVolts.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MeterReadingsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TariffCalculationEngine _engine;

    public MeterReadingsController(AppDbContext context, TariffCalculationEngine engine)
    {
        _context = context;
        _engine = engine;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MeterReading>>> GetAll()
    {
        return await _context.MeterReadings
            .OrderByDescending(r => r.ReadingDate)
            .ToListAsync();
    }

    [HttpGet("latest")]
    public async Task<ActionResult<MeterReading?>> GetLatest()
    {
        var latest = await _context.MeterReadings
            .OrderByDescending(r => r.ReadingDate)
            .FirstOrDefaultAsync();

        return Ok(latest);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MeterReading>> GetById(int id)
    {
        var item = await _context.MeterReadings.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost("calculate")]
    public async Task<ActionResult<CalculationResponse>> CalculateAndOptionallySave([FromBody] CalculationRequest request)
    {
        var config = await _context.AppConfigs.FirstOrDefaultAsync() ?? new AppConfig();
        var tariff = await _context.TariffConfigs
            .Include(t => t.TierBlocks)
            .FirstOrDefaultAsync(t => t.IsActive)
            ?? await _context.TariffConfigs.Include(t => t.TierBlocks).FirstOrDefaultAsync();

        if (tariff == null)
        {
            return BadRequest("No active tariff configuration found in database.");
        }

        if (request.MeterMaxDigits.HasValue)
        {
            config.MeterMaxDigits = request.MeterMaxDigits.Value;
        }

        var result = _engine.CalculateBill(
            request.ReadingPrevious,
            request.ReadingCurrent,
            tariff,
            config,
            request.DaysBetweenReadings);

        if (request.SaveToHistory)
        {
            var readingRecord = new MeterReading
            {
                ReadingDate = DateTime.UtcNow,
                ReadingPrevious = request.ReadingPrevious,
                ReadingCurrent = request.ReadingCurrent,
                DeltaNetConsumption = result.NetConsumptionKwh,
                SnapshotCalculatedCostNio = result.CalculatedCostNio,
                SnapshotCalculatedCostUsd = result.CalculatedCostUsd,
                HadRollover = result.HadRollover,
                IsOverSubsidyThreshold = !result.IsEligibleForSocialTariff,
                ProjectedMonthlyKwh = result.ProjectedMonthlyKwh,
                ProjectedMonthlyCostNio = result.ProjectedMonthlyCostNio,
                Notes = request.Notes ?? (result.HadRollover ? "Rollover de medidor detectado y compensado" : string.Empty),
                AppliedTariffConfigId = tariff.Id
            };

            _context.MeterReadings.Add(readingRecord);
            await _context.SaveChangesAsync();
            result.SavedReadingId = readingRecord.Id;
        }

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var reading = await _context.MeterReadings.FindAsync(id);
        if (reading == null) return NotFound();

        _context.MeterReadings.Remove(reading);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var readings = await _context.MeterReadings
            .OrderByDescending(r => r.ReadingDate)
            .Take(12)
            .ToListAsync();

        if (!readings.Any())
        {
            return Ok(new
            {
                totalReadings = 0,
                averageMonthlyKwh = 0,
                totalSpentCordobas = 0,
                subsidyAdherenceRate = 100,
                hasRolloverEvents = false
            });
        }

        decimal avgKwh = Math.Round(readings.Average(r => r.DeltaNetConsumption), 1);
        decimal totalSpent = Math.Round(readings.Sum(r => r.SnapshotCalculatedCostNio), 2);
        int compliantCount = readings.Count(r => !r.IsOverSubsidyThreshold);
        decimal adherencePercent = Math.Round(((decimal)compliantCount / readings.Count) * 100m, 1);
        bool hasRollovers = readings.Any(r => r.HadRollover);

        return Ok(new
        {
            totalReadings = readings.Count,
            averageMonthlyKwh = avgKwh,
            totalSpentCordobas = totalSpent,
            subsidyAdherenceRate = adherencePercent,
            hasRolloverEvents = hasRollovers,
            historyTrend = readings.Select(r => new
            {
                id = r.Id,
                date = r.ReadingDate.ToString("dd/MM/yyyy"),
                kwh = r.DeltaNetConsumption,
                costNio = r.SnapshotCalculatedCostNio,
                costUsd = r.SnapshotCalculatedCostUsd,
                isOverThreshold = r.IsOverSubsidyThreshold,
                hadRollover = r.HadRollover
            }).Reverse()
        });
    }
}
