using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SferumCabinet.Api.Data;

namespace SferumCabinet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SystemController : ControllerBase
{
    private readonly AppDbContext _context;

    public SystemController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var usersCount = await _context.Users.CountAsync();
        var roomsCount = await _context.Classrooms.CountAsync();
        var lessonsCount = await _context.ScheduleSlots.CountAsync();
        var statementsCount = await _context.Statements.CountAsync();
        var ticketsCount = await _context.Tickets.CountAsync();

        return Ok(new
        {
            service = "Сферум.Кабинет API",
            status = "Online",
            framework = ".NET 10 (ASP.NET Core Web API)",
            database = _context.Database.ProviderName,
            school = "МАОУ ЛИТ г. Новосибирска",
            activeClass = "9А (Классрук: Лосив Р. Б.)",
            serverTime = DateTime.UtcNow,
            stats = new
            {
                usersCount,
                roomsCount,
                lessonsCount,
                statementsCount,
                ticketsCount
            }
        });
    }

    [HttpGet("locator-preview")]
    public async Task<IActionResult> GetLocatorPreview()
    {
        var rooms = await _context.Classrooms.OrderBy(r => r.Number).ToListAsync();
        var activeLessons = await _context.ScheduleSlots
            .Where(s => s.LessonNumber == 4) // Допустим текущий 4-й урок для превью
            .ToListAsync();

        return Ok(new
        {
            currentLessonNumber = 4,
            currentLessonTime = "11:30 – 12:15",
            timeUntilBellMinutes = 18,
            rooms,
            activeLessons
        });
    }

    [HttpGet("statements-preview")]
    public async Task<IActionResult> GetStatementsPreview()
    {
        var statements = await _context.Statements.OrderByDescending(s => s.CreatedAt).ToListAsync();
        return Ok(statements);
    }

    [HttpGet("tickets-preview")]
    public async Task<IActionResult> GetTicketsPreview()
    {
        var tickets = await _context.Tickets.OrderByDescending(t => t.ReportedAt).ToListAsync();
        return Ok(tickets);
    }
}
