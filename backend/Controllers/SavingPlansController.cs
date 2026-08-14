using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerVolts.Server.Data;
using PowerVolts.Server.DTOs;
using PowerVolts.Server.Models;
using PowerVolts.Server.Services;

namespace PowerVolts.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SavingPlansController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly EnergySavingService _savingService;

    public SavingPlansController(AppDbContext context, EnergySavingService savingService)
    {
        _context = context;
        _savingService = savingService;
    }

    [HttpGet("active")]
    public async Task<ActionResult<SavingPlanSummaryDto>> GetActivePlan()
    {
        var plan = await _context.SavingPlans
            .Include(p => p.Items)
                .ThenInclude(i => i.Appliance)
            .FirstOrDefaultAsync(p => p.IsActive)
            ?? await _context.SavingPlans
                .Include(p => p.Items)
                    .ThenInclude(i => i.Appliance)
                .FirstOrDefaultAsync();

        if (plan == null) return NotFound("No saving plan found.");

        var tariff = await _context.TariffConfigs.Include(t => t.TierBlocks).FirstOrDefaultAsync(t => t.IsActive)
            ?? await _context.TariffConfigs.Include(t => t.TierBlocks).FirstOrDefaultAsync();

        var config = await _context.AppConfigs.FirstOrDefaultAsync() ?? new AppConfig();

        if (tariff == null) return BadRequest("Tariff config missing.");

        var summary = _savingService.BuildPlanSummary(plan, tariff, config);
        return Ok(summary);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SavingPlan>>> GetAll()
    {
        return await _context.SavingPlans
            .Include(p => p.Items)
            .ToListAsync();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePlan(int id, [FromBody] SavingPlan plan)
    {
        if (id != plan.Id) return BadRequest();

        var existing = await _context.SavingPlans.FindAsync(id);
        if (existing == null) return NotFound();

        existing.PlanName = plan.PlanName;
        existing.Description = plan.Description;
        existing.TargetKwhLimit = plan.TargetKwhLimit;
        existing.TargetBudgetCordobas = plan.TargetBudgetCordobas;
        existing.IsActive = plan.IsActive;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpPost("{planId}/items")]
    public async Task<ActionResult<SavingPlanItem>> AddItem(int planId, [FromBody] SavingPlanItem item)
    {
        var plan = await _context.SavingPlans.FindAsync(planId);
        if (plan == null) return NotFound("Plan not found.");

        item.SavingPlanId = planId;
        _context.SavingPlanItems.Add(item);
        await _context.SaveChangesAsync();

        return Ok(item);
    }

    [HttpPut("items/{itemId}")]
    public async Task<IActionResult> UpdateItem(int itemId, [FromBody] SavingPlanItem updated)
    {
        var existing = await _context.SavingPlanItems.FindAsync(itemId);
        if (existing == null) return NotFound();

        existing.CustomName = updated.CustomName;
        existing.Category = updated.Category;
        existing.Quantity = updated.Quantity;
        existing.Watts = updated.Watts;
        existing.HoursPerDay = updated.HoursPerDay;
        existing.DaysPerWeek = updated.DaysPerWeek;
        existing.ScheduleTimeRange = updated.ScheduleTimeRange;
        existing.Notes = updated.Notes;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("items/{itemId}")]
    public async Task<IActionResult> DeleteItem(int itemId)
    {
        var item = await _context.SavingPlanItems.FindAsync(itemId);
        if (item == null) return NotFound();

        _context.SavingPlanItems.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("simulate")]
    public async Task<ActionResult<SavingSimulationResult>> Simulate([FromBody] SavingSimulationRequest request)
    {
        var item = await _context.SavingPlanItems
            .Include(i => i.Appliance)
            .FirstOrDefaultAsync(i => i.Id == request.SavingPlanItemId);

        if (item == null) return NotFound("Appliance item not found");

        var tariff = await _context.TariffConfigs.Include(t => t.TierBlocks).FirstOrDefaultAsync(t => t.IsActive)
            ?? await _context.TariffConfigs.Include(t => t.TierBlocks).FirstOrDefaultAsync();

        var config = await _context.AppConfigs.FirstOrDefaultAsync() ?? new AppConfig();
        if (tariff == null) return BadRequest("Tariff config missing");

        var result = _savingService.SimulateReduction(item, request.NewHoursPerDay, request.NewDaysPerWeek, tariff, config);
        return Ok(result);
    }
}
