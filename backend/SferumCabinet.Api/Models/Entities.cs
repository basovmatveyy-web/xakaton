namespace SferumCabinet.Api.Models;

public enum UserRole
{
    Teacher,        // Учитель-предметник
    ClassTeacher,   // Классный руководитель
    HeadTeacher,    // Завуч / Администрация
    Staff,          // Завхоз / Сисадмин
    Student         // Ученик
}

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Teacher;
    public string Subject { get; set; } = string.Empty;
    public string? AssignedClass { get; set; } // Например, "9А" для классрука
    public string Email { get; set; } = string.Empty;
    public string SferumUserId { get; set; } = string.Empty;
    public string? Snils { get; set; }
    public string? PasswordHash { get; set; }
    public string? PasswordSalt { get; set; }
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public string SchoolName { get; set; } = "МАОУ ЛИТ г. Новосибирск";
    public string SchoolId { get; set; } = "maou-lit-nsk";
    public DateTime? LastLoginAt { get; set; }
    public string AvatarInitials => string.Join("", FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(s => s[0])).ToUpper();
}

public class School
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty; // e.g. "maou-lit-nsk"
    public string Name { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string City { get; set; } = "г. Новосибирск";
    public string Region { get; set; } = "Новосибирская область";
    public string Address { get; set; } = string.Empty;
    public string Inn { get; set; } = string.Empty;
    public string Ogrn { get; set; } = string.Empty;
    public string AccreditationStatus { get; set; } = "Государственная аккредитация (бессрочно)";
    public string Website { get; set; } = string.Empty;
    public bool IsDefault { get; set; } = false;
}

public class Classroom
{
    public int Id { get; set; }
    public string Number { get; set; } = string.Empty; // "311"
    public int Floor { get; set; } = 3;
    public int Capacity { get; set; } = 30;
    public string Equipment { get; set; } = "Интерактивная доска, Проектор";
    public string Status { get; set; } = "Free"; // Free, Occupied, Maintenance
    public string? Notes { get; set; }
}

public class ScheduleSlot
{
    public int Id { get; set; }
    public int LessonNumber { get; set; } // 1..7
    public string TimeStart { get; set; } = "08:30";
    public string TimeEnd { get; set; } = "09:15";
    public DayOfWeek DayOfWeek { get; set; } = DayOfWeek.Monday;
    public string ClassroomNumber { get; set; } = "311";
    public string ClassGrade { get; set; } = "9А";
    public string Subject { get; set; } = "Геометрия";
    public string TeacherName { get; set; } = "Лосив Роман Борисович";
    public int TeacherId { get; set; } = 1;
    public bool IsTransferred { get; set; } = false;
    public string? OriginalClassroomNumber { get; set; }
    public string? TransferReason { get; set; }
}

public class StudentStatement
{
    public int Id { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string ClassGrade { get; set; } = "9А";
    public string ParentName { get; set; } = string.Empty;
    public string ParentPhone { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Reason { get; set; } = "Болезнь"; // Болезнь, Семейные обстоятельства, Олимпиада
    public string Status { get; set; } = "SickLeaveActive"; // SickLeaveActive, Approved, Archived
    public string? PhotoAttachmentUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Comment { get; set; }
}

public class MaintenanceTicket
{
    public int Id { get; set; }
    public string ClassroomNumber { get; set; } = "311";
    public string Category { get; set; } = "Проектор"; // Проектор, Лампы, Мебель, ПК/Картридж, Другое
    public string Description { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string Urgency { get; set; } = "High"; // High, Normal, Low
    public string Status { get; set; } = "Open"; // Open, InProgress, Resolved
    public string ReportedBy { get; set; } = "Лосив Р. Б.";
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
    public string? ResolvedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionNotes { get; set; }
}

public class AcademicDebt
{
    public int Id { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string ClassGrade { get; set; } = "9А";
    public string Subject { get; set; } = "Физика";
    public string AssignmentTitle { get; set; } = "Лабораторная работа №2";
    public DateTime DueDate { get; set; } = DateTime.UtcNow.AddDays(-7);
    public string DebtType { get; set; } = "Не сдана работа"; // Пропуск КР, Двойка, Лабораторная
    public string Status { get; set; } = "Pending"; // Pending, Cleared
    public string RetakeRoom { get; set; } = "311";
    public string RetakeLesson { get; set; } = "Вторник, 6 урок (13:30)";
    public bool NotificationSent { get; set; } = false;
}

public class KnowledgeCard
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Subject { get; set; } = "Алгебра";
    public string Topic { get; set; } = "Квадратные корни и иррациональные уравнения";
    public string ClassGrade { get; set; } = "8 класс";
    public int VariantsCount { get; set; } = 4;
    public int QuestionsCount { get; set; } = 3;
    public string Difficulty { get; set; } = "Базовый + Повышенный";
    public string ContentJson { get; set; } = string.Empty; // Сериализованные варианты и ответы
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = "Лосив Р. Б.";
}
