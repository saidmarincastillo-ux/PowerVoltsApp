using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerVolts.Server.Data;
using PowerVolts.Server.Models;

namespace PowerVolts.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppConfigController : ControllerBase
{
    private readonly AppDbContext _context;

    public AppConfigController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<AppConfig>> GetConfig()
    {
        var config = await _context.AppConfigs.FirstOrDefaultAsync();
        if (config == null)
        {
            config = new AppConfig();
            _context.AppConfigs.Add(config);
            await _context.SaveChangesAsync();
        }
        return config;
    }

    [HttpPut]
    public async Task<IActionResult> UpdateConfig([FromBody] AppConfig updated)
    {
        var existing = await _context.AppConfigs.FirstOrDefaultAsync();
        if (existing == null)
        {
            _context.AppConfigs.Add(updated);
        }
        else
        {
            existing.DefaultCurrency = updated.DefaultCurrency;
            existing.ExchangeRateNioToUsd = updated.ExchangeRateNioToUsd;
            existing.MeterMaxDigits = updated.MeterMaxDigits;
            existing.EnableSubsidyAlerts = updated.EnableSubsidyAlerts;
            existing.SocialTariffThresholdKwh = updated.SocialTariffThresholdKwh;
        }

        await _context.SaveChangesAsync();
        return Ok(existing ?? updated);
    }
}
