namespace SferumCabinet.Api.DTOs;

public record CreateStatementDto(
    string StudentName,
    string ClassGrade,
    string ParentName,
    string ParentPhone,
    DateTime StartDate,
    DateTime EndDate,
    string Reason,
    string? Comment,
    string? PhotoAttachmentBase64
);

public record UpdateStatementStatusDto(string Status, string? Comment);

public record CreateTicketDto(
    string ClassroomNumber,
    string Category,
    string Description,
    string Urgency,
    string ReportedBy,
    string? PhotoBase64
);

public record UpdateTicketStatusDto(string Status, string? ResolutionNotes, string? ResolvedBy);

public record TransferLessonDto(
    int ScheduleSlotId,
    string NewClassroomNumber,
    string Reason
);

public record DirectMessageDto(
    string StudentName,
    string ClassGrade,
    string MessageText,
    string Purpose // "Пересдача", "Консультация", "Замечание", "Справка"
);

public record GenerateCardRequestDto(
    string Subject,
    string Topic,
    string Grade,
    int VariantsCount,
    int QuestionsCount,
    string Difficulty
);

public record CloneTaskRequestDto(
    string OriginalTaskText,
    string? ImageBase64
);

public record ExamPrototypeRequestDto(
    string ExamType, // "ОГЭ", "ЕГЭ", "ВПР"
    string Subject,
    int QuestionNumber,
    string? SpecificTopic
);

public record AssistantChatRequestDto(
    string Message,
    string? SelectedChip, // "Таблица", "Объяснить просто", "Идея для урока", "Объявление"
    string? ContextRole
);

public record NotifyDebtDto(
    int DebtId,
    string RetakeRoom,
    string RetakeLesson
);

public record AiChatRequestDto(
    string Message,
    string? ContextRole,
    string? ClassGrade,
    string? Subject,
    string? ApiKey
);

public record AiChatResponseDto(
    string Reply,
    bool HasPdfDownload,
    string? PdfTitle,
    string? Model
);

public record ExportDocumentPdfRequestDto(
    string Title,
    string Content,
    string? TeacherName,
    string? SchoolName
);

public record ExportCardPdfRequestDto(
    string Topic,
    string? Difficulty,
    List<CardVariantDto> Variants,
    string? SchoolName
);

public record CardVariantDto(
    int Num,
    string Task,
    string? Formula,
    string? Ans
);
