using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerVolts.Server.Data;
using PowerVolts.Server.Models;

namespace PowerVolts.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppliancesController : ControllerBase
{
    private readonly AppDbContext _context;

    public AppliancesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Appliance>>> GetAll()
    {
        return await _context.Appliances
            .OrderBy(a => a.Category)
            .ThenBy(a => a.Name)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Appliance>> Create([FromBody] Appliance appliance)
    {
        _context.Appliances.Add(appliance);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = appliance.Id }, appliance);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Appliance appliance)
    {
        if (id != appliance.Id) return BadRequest();
        _context.Entry(appliance).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Appliances.FindAsync(id);
        if (item == null) return NotFound();
        _context.Appliances.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
