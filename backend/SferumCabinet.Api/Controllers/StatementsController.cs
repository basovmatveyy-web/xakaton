using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SferumCabinet.Api.Data;
using SferumCabinet.Api.Services;

namespace SferumCabinet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatementsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly PdfArchiveService _pdfService;

    public StatementsController(AppDbContext context, PdfArchiveService pdfService)
    {
        _context = context;
        _pdfService = pdfService;
    }

    [HttpGet]
    public async Task<IActionResult> GetStatements([FromQuery] string? classGrade)
    {
        var query = _context.Statements.AsQueryable();
        if (!string.IsNullOrEmpty(classGrade))
        {
            query = query.Where(s => s.ClassGrade == classGrade);
        }

        var list = await query.OrderByDescending(s => s.CreatedAt).ToListAsync();
        return Ok(list);
    }

    [HttpGet("export-pdf")]
    public async Task<IActionResult> ExportPdf([FromQuery] string classGrade = "9А", [FromQuery] int month = 10)
    {
        var statements = await _context.Statements
            .Where(s => s.ClassGrade == classGrade)
            .OrderBy(s => s.StudentName)
            .ToListAsync();

        if (statements.Count == 0)
        {
            statements = await _context.Statements.OrderBy(s => s.StudentName).ToListAsync();
        }

        var pdfBytes = _pdfService.GenerateStatementsArchivePdf(
            "МАОУ Лицей Информационных Технологий (МАОУ ЛИТ)",
            classGrade,
            statements,
            "Лосив Роман Борисович"
        );

        var filename = $"Tabel_Zayavleniy_{classGrade}_{month:D2}.pdf";
        return File(pdfBytes, "application/pdf", filename);
    }
}
