using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SferumCabinet.Api.Models;

namespace SferumCabinet.Api.Services;

public class PdfArchiveService
{
    static PdfArchiveService()
    {
        // Community License for QuestPDF
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateStatementsArchivePdf(string schoolName, string classGrade, List<StudentStatement> statements, string teacherName)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(20, Unit.Millimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text(schoolName.ToUpper()).Bold().FontSize(12).FontColor(Colors.Blue.Darken3);
                            c.Item().Text("ДЕПАРТАМЕНТ ОБРАЗОВАНИЯ МЭРИИ ГОРОДА НОВОСИБИРСКА").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"ОФИЦИАЛЬНЫЙ АРХИВ-РЕЕСТР ЗАЯВЛЕНИЙ О ПРОПУСКАХ ЗАНЯТИЙ").Bold().FontSize(11).FontColor(Colors.Black);
                            c.Item().Text($"Класс: {classGrade} | Классный руководитель: {teacherName}").FontSize(9);
                        });

                        row.ConstantItem(80).AlignRight().Column(c =>
                        {
                            c.Item().Border(1).BorderColor(Colors.Blue.Medium).Padding(4).Column(b =>
                            {
                                b.Item().Text("СФЕРУМ").Bold().FontSize(8).FontColor(Colors.Blue.Darken2);
                                b.Item().Text("Эл. архив").FontSize(7);
                                b.Item().Text(DateTime.Now.ToString("dd.MM.yyyy")).FontSize(7);
                            });
                        });
                    });

                    col.Item().PaddingVertical(8).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                });

                page.Content().PaddingTop(10).Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(25);  // №
                            columns.RelativeColumn(3);   // Ученик
                            columns.RelativeColumn(2);   // Даты
                            columns.RelativeColumn(2);   // Причина
                            columns.RelativeColumn(2);   // Заявитель (Родитель)
                            columns.RelativeColumn(2);   // Статус
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("№").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("ФИО Ученика").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Период").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Причина").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Родитель").Bold();
                            header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Отметка").Bold();
                        });

                        var sortedStatements = statements.OrderBy(s => s.StudentName).ThenBy(s => s.StartDate).ToList();
                        int idx = 1;

                        foreach (var stmt in sortedStatements)
                        {
                            var bgColor = idx % 2 == 0 ? Colors.Grey.Lighten4 : Colors.White;
                            var days = (stmt.EndDate.Date - stmt.StartDate.Date).Days + 1;
                            string period = $"{stmt.StartDate:dd.MM} – {stmt.EndDate:dd.MM} ({days} дн.)";

                            table.Cell().Background(bgColor).Padding(4).Text(idx.ToString());
                            table.Cell().Background(bgColor).Padding(4).Text(stmt.StudentName).SemiBold();
                            table.Cell().Background(bgColor).Padding(4).Text(period);
                            table.Cell().Background(bgColor).Padding(4).Text(stmt.Reason);
                            table.Cell().Background(bgColor).Padding(4).Text(stmt.ParentName);
                            table.Cell().Background(bgColor).Padding(4).Text(
                                stmt.Status == "SickLeaveActive" ? "Больничный (справка)" :
                                stmt.Status == "Approved" ? "Заявление принято" : "В обработке"
                            ).FontSize(8);

                            idx++;
                        }
                    });

                    col.Item().PaddingTop(25).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text($"Классный руководитель: _________________ / {teacherName} /").FontSize(9);
                            c.Item().PaddingTop(4).Text("Документы проверены и сверены с классным журналом").Italic().FontSize(8).FontColor(Colors.Grey.Darken1);
                        });

                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Заместитель директора по УВР: _________________").FontSize(9);
                            c.Item().PaddingTop(4).Text("М.П. Принято в делопроизводство школы").Italic().FontSize(8).FontColor(Colors.Grey.Darken1);
                        });
                    });
                });

                page.Footer().Row(row =>
                {
                    row.RelativeItem().Text("Сгенерировано в системе «Сферум.Кабинет» | Соответствует ФЗ № 152").FontSize(8).FontColor(Colors.Grey.Medium);
                    row.ConstantItem(50).AlignRight().Text(x =>
                    {
                        x.CurrentPageNumber().FontSize(8);
                        x.Span(" / ").FontSize(8);
                        x.TotalPages().FontSize(8);
                    });
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] GenerateAiDocumentPdf(string schoolName, string title, string content, string teacherName)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(20, Unit.Millimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken4));

                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text(schoolName.ToUpper()).Bold().FontSize(12).FontColor(Colors.Blue.Darken3);
                            c.Item().Text("ДЕПАРТАМЕНТ ОБРАЗОВАНИЯ МЭРИИ ГОРОДА НОВОСИБИРСКА").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text(title.ToUpper()).Bold().FontSize(11).FontColor(Colors.Black);
                        });

                        row.ConstantItem(90).AlignRight().Column(c =>
                        {
                            c.Item().Border(1).BorderColor(Colors.Blue.Medium).Padding(4).Column(b =>
                            {
                                b.Item().Text("СФЕРУМ").Bold().FontSize(8).FontColor(Colors.Blue.Darken2);
                                b.Item().Text("Эл. документ").FontSize(7);
                                b.Item().Text(DateTime.Now.ToString("dd.MM.yyyy")).FontSize(7);
                            });
                        });
                    });

                    col.Item().PaddingVertical(8).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                });

                page.Content().PaddingTop(10).Column(col =>
                {
                    var lines = content.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
                    foreach (var line in lines)
                    {
                        if (string.IsNullOrWhiteSpace(line))
                        {
                            col.Item().PaddingVertical(3);
                        }
                        else if (line.StartsWith("### "))
                        {
                            col.Item().PaddingTop(8).PaddingBottom(3).Text(line.Substring(4)).Bold().FontSize(12).FontColor(Colors.Blue.Darken2);
                        }
                        else if (line.StartsWith("## "))
                        {
                            col.Item().PaddingTop(10).PaddingBottom(3).Text(line.Substring(3)).Bold().FontSize(13).FontColor(Colors.Blue.Darken3);
                        }
                        else if (line.StartsWith("# "))
                        {
                            col.Item().PaddingTop(12).PaddingBottom(4).Text(line.Substring(2)).Bold().FontSize(14).FontColor(Colors.Black);
                        }
                        else if (line.StartsWith("- ") || line.StartsWith("* "))
                        {
                            col.Item().PaddingLeft(10).Text($"• {line.Substring(2)}").FontSize(10);
                        }
                        else if (line.StartsWith("> "))
                        {
                            col.Item().BorderLeft(3).BorderColor(Colors.Blue.Medium).PaddingLeft(8).Text(line.Substring(2)).Italic().FontSize(10);
                        }
                        else
                        {
                            col.Item().Text(line).FontSize(10);
                        }
                    }

                    col.Item().PaddingTop(25).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text($"Составитель: _________________ / {teacherName} /").FontSize(9);
                            c.Item().PaddingTop(3).Text("Документ сформирован в государственной образовательной среде «Сферум.Кабинет»").Italic().FontSize(8).FontColor(Colors.Grey.Darken1);
                        });

                        row.RelativeItem().AlignRight().Column(c =>
                        {
                            c.Item().Text("Электронная подпись подтверждена").Bold().FontSize(9).FontColor(Colors.Green.Darken2);
                            c.Item().Text("Сертификат: RU-ED-2026-СФЕРУМ • 152-ФЗ").FontSize(7).FontColor(Colors.Grey.Darken1);
                        });
                    });
                });

                page.Footer().Row(row =>
                {
                    row.RelativeItem().Text("Школьная образовательная платформа «Сферум.Кабинет» • 152-ФЗ").FontSize(8).FontColor(Colors.Grey.Medium);
                    row.ConstantItem(50).AlignRight().Text(x =>
                    {
                        x.CurrentPageNumber().FontSize(8);
                        x.Span(" / ").FontSize(8);
                        x.TotalPages().FontSize(8);
                    });
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] GenerateCardPdf(string schoolName, string topic, string difficulty, List<DTOs.CardVariantDto> variants)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(12, Unit.Millimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(9).FontColor(Colors.Grey.Darken4));

                page.Header().Column(col =>
                {
                    col.Item().Row(r =>
                    {
                        r.RelativeItem().Text($"{schoolName.ToUpper()} • РАЗДАТОЧНЫЙ МАТЕРИАЛ (4 ВАРИАНТА)").Bold().FontSize(9).FontColor(Colors.Blue.Darken3);
                        r.ConstantItem(180).AlignRight().Text($"Тема: {topic}").FontSize(8).FontColor(Colors.Grey.Darken2);
                    });
                    col.Item().PaddingVertical(4).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);
                });

                page.Content().PaddingTop(6).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                    });

                    foreach (var v in variants)
                    {
                        table.Cell().Padding(5).Border(1).BorderColor(Colors.Grey.Lighten1).Padding(8).Column(c =>
                        {
                            c.Item().Row(hr =>
                            {
                                hr.RelativeItem().Text($"ВАРИАНТ {v.Num} • 9А КЛАСС").Bold().FontSize(10).FontColor(Colors.Blue.Darken2);
                                hr.ConstantItem(75).AlignRight().Text("ФИО: _________").FontSize(7);
                            });

                            c.Item().PaddingVertical(3).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten3);
                            c.Item().Text(v.Task).FontSize(9).LineHeight(1.25f);
                            if (!string.IsNullOrEmpty(v.Formula))
                            {
                                c.Item().PaddingTop(3).Text($"Формула: {v.Formula}").FontSize(8).FontColor(Colors.Blue.Darken3);
                            }

                            c.Item().PaddingTop(10).Row(ansRow =>
                            {
                                ansRow.RelativeItem().Text("Место для решения и ответа:").FontSize(7).Italic();
                                ansRow.ConstantItem(70).AlignRight().Text("Балл: [  / 5 ]").Bold().FontSize(8);
                            });

                            c.Item().PaddingTop(6).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);
                            c.Item().PaddingTop(2).Row(cut =>
                            {
                                cut.RelativeItem().Text("Линия отреза для учителя").FontSize(6).FontColor(Colors.Grey.Darken1);
                                cut.ConstantItem(70).AlignRight().Text($"Ответ: {v.Ans}").FontSize(7).Bold();
                            });
                        });
                    }
                });

                page.Footer().Row(row =>
                {
                    row.RelativeItem().Text("Конструктор проверочных работ «Сферум.Кабинет» • ФИПИ ОГЭ/ЕГЭ").FontSize(7).FontColor(Colors.Grey.Medium);
                    row.ConstantItem(70).AlignRight().Text(DateTime.Now.ToString("dd.MM.yyyy")).FontSize(7);
                });
            });
        });

        return document.GeneratePdf();
    }
}
