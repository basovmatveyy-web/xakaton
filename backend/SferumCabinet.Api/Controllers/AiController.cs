using Microsoft.AspNetCore.Mvc;
using SferumCabinet.Api.DTOs;
using SferumCabinet.Api.Services;

namespace SferumCabinet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly GeminiAiService _geminiService;
    private readonly PdfArchiveService _pdfService;

    public AiController(GeminiAiService geminiService, PdfArchiveService pdfService)
    {
        _geminiService = geminiService;
        _pdfService = pdfService;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] AiChatRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { error = "Сообщение не может быть пустым" });
        }

        var (reply, modelName) = await _geminiService.AssistantChatAsync(
            request.Message,
            request.ApiKey,
            request.ContextRole,
            request.ClassGrade
        );

        bool hasPdf = reply.Contains("###") || reply.Contains("|") || reply.Contains("1.");
        string title = "Методический документ";
        if (reply.Contains("### "))
        {
            var firstHeader = reply.Split(new[] { "### " }, StringSplitOptions.None)[1]
                .Split(new[] { "\r", "\n" }, StringSplitOptions.None)[0].Trim();
            if (!string.IsNullOrEmpty(firstHeader)) title = firstHeader;
        }

        return Ok(new AiChatResponseDto(
            Reply: reply,
            HasPdfDownload: hasPdf,
            PdfTitle: title,
            Model: modelName
        ));
    }

    [HttpPost("generate-card")]
    public async Task<IActionResult> GenerateCard([FromBody] GenerateCardRequestDto request)
    {
        var resultJson = await _geminiService.GenerateCardAsync(
            request.Subject,
            request.Topic,
            request.Grade,
            request.VariantsCount,
            request.QuestionsCount,
            request.Difficulty
        );

        return Content(resultJson, "application/json");
    }

    [HttpPost("export-document-pdf")]
    public IActionResult ExportDocumentPdf([FromBody] ExportDocumentPdfRequestDto request)
    {
        var school = request.SchoolName ?? "МАОУ Лицей Информационных Технологий (МАОУ ЛИТ)";
        var teacher = request.TeacherName ?? "Лосив Роман Борисович";
        var pdfBytes = _pdfService.GenerateAiDocumentPdf(school, request.Title, request.Content, teacher);

        var filename = $"Dokument_{DateTime.Now:yyyyMMdd_HHmm}.pdf";
        return File(pdfBytes, "application/pdf", filename);
    }

    [HttpPost("export-card-pdf")]
    public IActionResult ExportCardPdf([FromBody] ExportCardPdfRequestDto request)
    {
        var school = request.SchoolName ?? "МАОУ Лицей Информационных Технологий (МАОУ ЛИТ)";
        var pdfBytes = _pdfService.GenerateCardPdf(school, request.Topic, request.Difficulty ?? "Базовый", request.Variants);

        var filename = $"Kartochki_A4_{DateTime.Now:yyyyMMdd_HHmm}.pdf";
        return File(pdfBytes, "application/pdf", filename);
    }
}
