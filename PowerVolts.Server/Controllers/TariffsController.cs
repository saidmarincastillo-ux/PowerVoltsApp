using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerVolts.Server.Data;
using PowerVolts.Server.Models;

namespace PowerVolts.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TariffsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TariffsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("active")]
    public async Task<ActionResult<TariffConfig>> GetActiveTariff()
    {
        var tariff = await _context.TariffConfigs
            .Include(t => t.TierBlocks)
            .FirstOrDefaultAsync(t => t.IsActive)
            ?? await _context.TariffConfigs.Include(t => t.TierBlocks).FirstOrDefaultAsync();

        if (tariff == null) return NotFound("No active tariff found");
        return tariff;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TariffConfig>>> GetAll()
    {
        return await _context.TariffConfigs
            .Include(t => t.TierBlocks)
            .ToListAsync();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] TariffConfig updatedTariff)
    {
        if (id != updatedTariff.Id) return BadRequest();

        var existing = await _context.TariffConfigs
            .Include(t => t.TierBlocks)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (existing == null) return NotFound();

        existing.Name = updatedTariff.Name;
        existing.Description = updatedTariff.Description;
        existing.BasePricePerKwh = updatedTariff.BasePricePerKwh;
        existing.FixedCommercialCharge = updatedTariff.FixedCommercialCharge;
        existing.PublicLightingTaxPercentage = updatedTariff.PublicLightingTaxPercentage;
        existing.NonSubsidizedExtraRate = updatedTariff.NonSubsidizedExtraRate;
        existing.IsActive = updatedTariff.IsActive;

        // Update blocks
        _context.TariffTierBlocks.RemoveRange(existing.TierBlocks);
        if (updatedTariff.TierBlocks != null)
        {
            foreach (var block in updatedTariff.TierBlocks)
            {
                block.TariffConfigId = existing.Id;
                block.Id = 0;
                _context.TariffTierBlocks.Add(block);
            }
        }

        await _context.SaveChangesAsync();
        return Ok(existing);
    }
}
