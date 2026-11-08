namespace SferumCabinet.Api.DTOs;

/// <summary>
/// Запрос на вход по логину, СНИЛС или Email с паролем
/// </summary>
public record LoginRequestDto(
    string Login,
    string Password,
    string? SchoolId = null,
    bool RememberMe = false
);

/// <summary>
/// Запрос на мгновенную выдачу сессии для демонстрационных ролей жюри:
/// teacher (учитель), class_teacher (классрук), zavuch (завуч), staff (завхоз), student (ученик)
/// </summary>
public record DemoLoginRequestDto(
    string? Role = null,
    string? RoleId = null
);

/// <summary>
/// Запрос на авторизацию через Сферум ID / VK ID OAuth токен
/// </summary>
public record SferumIdLoginRequestDto(
    string Token,
    string? SferumUserId = null,
    string? FirstName = null,
    string? LastName = null,
    string? Phone = null,
    string? Email = null,
    string? AvatarUrl = null,
    string? SchoolId = null
);

/// <summary>
/// Матрица ролевого доступа RBAC для пользовательского интерфейса
/// </summary>
public record UserPermissionsDto(
    bool CanViewSchedule,
    bool CanEditSchedule,
    bool CanTransferLessons,
    bool CanManageClassrooms,
    bool CanCreateTicket,
    bool CanResolveTicket,
    bool CanGenerateAiCards,
    bool CanManageDebts,
    bool CanViewClassStatements,
    bool CanViewAllStatements,
    bool CanApproveStatements,
    bool CanAccessAdminPanel,
    bool CanExportReports,
    bool CanSendDirectMessages,
    List<string> Scopes
);

/// <summary>
/// Публичная схема профиля пользователя
/// </summary>
public record UserDto(
    int Id,
    string FullName,
    string Role,
    string RoleKey,
    string RoleDisplayName,
    string Subject,
    string? AssignedClass,
    string Email,
    string? Snils,
    string? Phone,
    string SferumUserId,
    string AvatarInitials,
    string? AvatarUrl,
    string SchoolName,
    string SchoolId,
    DateTime? LastLoginAt,
    UserPermissionsDto Permissions
);

/// <summary>
/// Ответ успешной авторизации с JWT Bearer токеном
/// </summary>
public record AuthResponseDto(
    bool Success,
    string Token,
    string TokenType,
    DateTime ExpiresAt,
    UserDto? User,
    string? Message = null
);

/// <summary>
/// Карточка аккредитованного образовательного учреждения
/// </summary>
public record SchoolDto(
    string Id,
    string Name,
    string ShortName,
    string City,
    string Region,
    string Address,
    string Inn,
    string Ogrn,
    string AccreditationStatus,
    string Website,
    bool IsDefault
);
