using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SferumCabinet.Api.DTOs;
using SferumCabinet.Api.Models;

namespace SferumCabinet.Api.Services;

public class TokenService
{
    private readonly IConfiguration _configuration;
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expiryDays;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
        _secretKey = _configuration["Jwt:Key"] ?? "SferumCabinet_Super_Secret_Key_2026_Auth_Bearer_Token_Signing_Key_MaouLit_Novosibirsk";
        _issuer = _configuration["Jwt:Issuer"] ?? "SferumCabinet.Api";
        _audience = _configuration["Jwt:Audience"] ?? "SferumCabinet.Client";
        _expiryDays = int.TryParse(_configuration["Jwt:ExpiryDays"], out var days) ? days : 7;
    }

    /// <summary>
    /// Генерирует подписанный криптографический JWT Bearer токен для пользователя
    /// </summary>
    public (string Token, DateTime ExpiresAt) GenerateToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_secretKey);
        var expiresAt = DateTime.UtcNow.AddDays(_expiryDays);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("role_key", GetRoleSlug(user.Role)),
            new("school_name", user.SchoolName ?? "МАОУ ЛИТ г. Новосибирск"),
            new("school_id", user.SchoolId ?? "maou-lit-nsk"),
            new("sferum_user_id", user.SferumUserId ?? string.Empty),
            new("assigned_class", user.AssignedClass ?? string.Empty)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return (tokenHandler.WriteToken(token), expiresAt);
    }

    /// <summary>
    /// Валидирует входящий JWT токен и возвращает ClaimsPrincipal
    /// </summary>
    public ClaimsPrincipal? ValidateToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_secretKey);

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(5)
            }, out _);

            return principal;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Извлекает числовой ID пользователя из ClaimsPrincipal
    /// </summary>
    public int? GetUserIdFromPrincipal(ClaimsPrincipal principal)
    {
        var idClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out var userId))
        {
            return userId;
        }
        return null;
    }

    /// <summary>
    /// Формирует детальную матрицу прав доступа (RBAC) в зависимости от роли
    /// </summary>
    public UserPermissionsDto GetPermissionsForRole(UserRole role)
    {
        return role switch
        {
            UserRole.HeadTeacher => new UserPermissionsDto(
                CanViewSchedule: true,
                CanEditSchedule: true,
                CanTransferLessons: true,
                CanManageClassrooms: true,
                CanCreateTicket: true,
                CanResolveTicket: true,
                CanGenerateAiCards: true,
                CanManageDebts: true,
                CanViewClassStatements: true,
                CanViewAllStatements: true,
                CanApproveStatements: true,
                CanAccessAdminPanel: true,
                CanExportReports: true,
                CanSendDirectMessages: true,
                Scopes: new List<string>
                {
                    "schedule:read", "schedule:write", "classrooms:manage",
                    "tickets:read_all", "tickets:create", "tickets:resolve",
                    "statements:read_all", "statements:approve", "debts:manage",
                    "reports:export", "admin:access", "aicards:generate", "messages:send"
                }
            ),

            UserRole.ClassTeacher => new UserPermissionsDto(
                CanViewSchedule: true,
                CanEditSchedule: false,
                CanTransferLessons: false,
                CanManageClassrooms: false,
                CanCreateTicket: true,
                CanResolveTicket: false,
                CanGenerateAiCards: true,
                CanManageDebts: true,
                CanViewClassStatements: true,
                CanViewAllStatements: false,
                CanApproveStatements: true,
                CanAccessAdminPanel: false,
                CanExportReports: true,
                CanSendDirectMessages: true,
                Scopes: new List<string>
                {
                    "schedule:read", "tickets:create", "aicards:generate",
                    "debts:manage", "statements:view_class", "statements:approve",
                    "reports:export", "messages:send"
                }
            ),

            UserRole.Teacher => new UserPermissionsDto(
                CanViewSchedule: true,
                CanEditSchedule: false,
                CanTransferLessons: false,
                CanManageClassrooms: false,
                CanCreateTicket: true,
                CanResolveTicket: false,
                CanGenerateAiCards: true,
                CanManageDebts: true,
                CanViewClassStatements: false,
                CanViewAllStatements: false,
                CanApproveStatements: false,
                CanAccessAdminPanel: false,
                CanExportReports: false,
                CanSendDirectMessages: true,
                Scopes: new List<string>
                {
                    "schedule:read", "tickets:create", "aicards:generate",
                    "debts:manage", "messages:send"
                }
            ),

            UserRole.Staff => new UserPermissionsDto(
                CanViewSchedule: true,
                CanEditSchedule: false,
                CanTransferLessons: false,
                CanManageClassrooms: true,
                CanCreateTicket: true,
                CanResolveTicket: true,
                CanGenerateAiCards: false,
                CanManageDebts: false,
                CanViewClassStatements: false,
                CanViewAllStatements: false,
                CanApproveStatements: false,
                CanAccessAdminPanel: false,
                CanExportReports: true,
                CanSendDirectMessages: false,
                Scopes: new List<string>
                {
                    "schedule:read", "classrooms:manage_status", "tickets:read_all",
                    "tickets:create", "tickets:resolve", "reports:export"
                }
            ),

            UserRole.Student => new UserPermissionsDto(
                CanViewSchedule: true,
                CanEditSchedule: false,
                CanTransferLessons: false,
                CanManageClassrooms: false,
                CanCreateTicket: false,
                CanResolveTicket: false,
                CanGenerateAiCards: false,
                CanManageDebts: false,
                CanViewClassStatements: false,
                CanViewAllStatements: false,
                CanApproveStatements: false,
                CanAccessAdminPanel: false,
                CanExportReports: false,
                CanSendDirectMessages: false,
                Scopes: new List<string>
                {
                    "schedule:read_class", "debts:read_own", "statements:create"
                }
            ),

            _ => new UserPermissionsDto(
                CanViewSchedule: true,
                CanEditSchedule: false,
                CanTransferLessons: false,
                CanManageClassrooms: false,
                CanCreateTicket: false,
                CanResolveTicket: false,
                CanGenerateAiCards: false,
                CanManageDebts: false,
                CanViewClassStatements: false,
                CanViewAllStatements: false,
                CanApproveStatements: false,
                CanAccessAdminPanel: false,
                CanExportReports: false,
                CanSendDirectMessages: false,
                Scopes: new List<string> { "schedule:read" }
            )
        };
    }

    /// <summary>
    /// Возвращает текстовый идентификатор роли (для фронтенда VKUI)
    /// </summary>
    public string GetRoleSlug(UserRole role) => role switch
    {
        UserRole.Teacher => "teacher",
        UserRole.ClassTeacher => "class_teacher",
        UserRole.HeadTeacher => "zavuch",
        UserRole.Staff => "staff",
        UserRole.Student => "student",
        _ => "teacher"
    };

    /// <summary>
    /// Возвращает официальное наименование должности в системе образования РФ
    /// </summary>
    public string GetRoleDisplayName(UserRole role) => role switch
    {
        UserRole.Teacher => "Учитель-предметник",
        UserRole.ClassTeacher => "Классный руководитель",
        UserRole.HeadTeacher => "Завуч по УВР",
        UserRole.Staff => "Завхоз / Инженер",
        UserRole.Student => "Ученик",
        _ => "Сотрудник"
    };

    /// <summary>
    /// Преобразует сущность User в публичный UserDto с расчетом RBAC прав
    /// </summary>
    public UserDto ToUserDto(User user)
    {
        return new UserDto(
            Id: user.Id,
            FullName: user.FullName,
            Role: user.Role.ToString(),
            RoleKey: GetRoleSlug(user.Role),
            RoleDisplayName: GetRoleDisplayName(user.Role),
            Subject: user.Subject,
            AssignedClass: user.AssignedClass,
            Email: user.Email,
            Snils: MaskSnils(user.Snils),
            Phone: user.Phone,
            SferumUserId: user.SferumUserId,
            AvatarInitials: user.AvatarInitials,
            AvatarUrl: user.AvatarUrl,
            SchoolName: string.IsNullOrEmpty(user.SchoolName) ? "МАОУ ЛИТ г. Новосибирск" : user.SchoolName,
            SchoolId: string.IsNullOrEmpty(user.SchoolId) ? "maou-lit-nsk" : user.SchoolId,
            LastLoginAt: user.LastLoginAt,
            Permissions: GetPermissionsForRole(user.Role)
        );
    }

    /// <summary>
    /// Маскирует номер СНИЛС для безопасного отображения в UI
    /// </summary>
    private static string? MaskSnils(string? snils)
    {
        if (string.IsNullOrWhiteSpace(snils))
            return null;

        var digits = new string(snils.Where(char.IsDigit).ToArray());
        if (digits.Length == 11)
        {
            return $"***-***-{digits.Substring(6, 3)} {digits.Substring(9, 2)}";
        }

        return snils;
    }

    /// <summary>
    /// Хэширование пароля с использованием HMACSHA256 и уникальной криптографической соли
    /// </summary>
    public (string Hash, string Salt) HashPassword(string password)
    {
        byte[] saltBytes = RandomNumberGenerator.GetBytes(16);
        string salt = Convert.ToBase64String(saltBytes);
        using var hmac = new HMACSHA256(saltBytes);
        byte[] hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return (Convert.ToBase64String(hashBytes), salt);
    }

    /// <summary>
    /// Проверка пароля пользователя с поддержкой эталонных демонстрационных паролей для хакатона
    /// </summary>
    public bool VerifyPassword(string inputPassword, string? storedHash, string? storedSalt)
    {
        // 1. Демонстрационные мастер-пароли для жюри и бесшовного локального тестирования
        if (inputPassword is "sferum2026" or "sferum" or "admin" or "password" or "123456" or "lit54")
        {
            return true;
        }

        if (string.IsNullOrEmpty(storedHash) || string.IsNullOrEmpty(storedSalt))
        {
            return false;
        }

        try
        {
            byte[] saltBytes = Convert.FromBase64String(storedSalt);
            using var hmac = new HMACSHA256(saltBytes);
            byte[] computedHashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(inputPassword));
            string computedHash = Convert.ToBase64String(computedHashBytes);

            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(computedHash),
                Encoding.UTF8.GetBytes(storedHash)
            );
        }
        catch
        {
            return false;
        }
    }
}
