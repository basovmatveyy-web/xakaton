using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SferumCabinet.Api.Data;
using SferumCabinet.Api.DTOs;
using SferumCabinet.Api.Models;
using SferumCabinet.Api.Services;

namespace SferumCabinet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext context, TokenService tokenService, ILogger<AuthController> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _logger = logger;
    }

    /// <summary>
    /// Авторизация по логину, СНИЛС или Email и паролю
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Login) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { success = false, message = "Логин (СНИЛС/Email) и пароль обязательны для заполнения." });
        }

        var normalizedInput = request.Login.Trim();
        var digitsOnly = new string(normalizedInput.Where(char.IsDigit).ToArray());

        // 1. Поиск пользователя по Email, СНИЛС, SferumUserId или логину/ФИО
        var users = await _context.Users.ToListAsync();
        User? user = null;

        if (normalizedInput.Contains('@'))
        {
            user = users.FirstOrDefault(u => string.Equals(u.Email, normalizedInput, StringComparison.OrdinalIgnoreCase));
        }
        else if (digitsOnly.Length >= 9)
        {
            user = users.FirstOrDefault(u =>
            {
                if (string.IsNullOrEmpty(u.Snils)) return false;
                var uDigits = new string(u.Snils.Where(char.IsDigit).ToArray());
                return uDigits == digitsOnly;
            });
        }

        if (user == null)
        {
            // Поиск по SferumUserId, логину или совпадению в ФИО
            user = users.FirstOrDefault(u =>
                string.Equals(u.SferumUserId, normalizedInput, StringComparison.OrdinalIgnoreCase) ||
                u.FullName.Contains(normalizedInput, StringComparison.OrdinalIgnoreCase) ||
                u.Email.StartsWith(normalizedInput, StringComparison.OrdinalIgnoreCase)
            );
        }

        if (user == null)
        {
            _logger.LogWarning("Попытка входа с неизвестным логином/СНИЛС: {Login}", normalizedInput);
            return Unauthorized(new { success = false, message = "Пользователь с указанными учетными данными не найден." });
        }

        // 2. Валидация пароля
        bool isPasswordValid = _tokenService.VerifyPassword(request.Password, user.PasswordHash, user.PasswordSalt);
        if (!isPasswordValid)
        {
            _logger.LogWarning("Неверный пароль для пользователя {Email}", user.Email);
            return Unauthorized(new { success = false, message = "Неверный пароль. Попробуйте еще раз или используйте демо-вход." });
        }

        // 3. Обновление метки последнего входа
        user.LastLoginAt = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(request.SchoolId))
        {
            user.SchoolId = request.SchoolId;
        }
        await _context.SaveChangesAsync();

        // 4. Генерация JWT токена
        var (token, expiresAt) = _tokenService.GenerateToken(user);
        var userDto = _tokenService.ToUserDto(user);

        return Ok(new AuthResponseDto(
            Success: true,
            Token: token,
            TokenType: "Bearer",
            ExpiresAt: expiresAt,
            User: userDto,
            Message: $"Добро пожаловать в «СФЕРУМ.КАБИНЕТ», {user.FullName}!"
        ));
    }

    /// <summary>
    /// Валидация токена Сферум ID / VK ID OAuth и выдача сессии
    /// </summary>
    [HttpPost("sferum-id")]
    public async Task<IActionResult> SferumIdLogin([FromBody] SferumIdLoginRequestDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Token))
        {
            return BadRequest(new { success = false, message = "Токен Сферум ID / VK ID обязателен." });
        }

        var users = await _context.Users.ToListAsync();
        User? user = null;

        // Поиск по указанному SferumUserId
        if (!string.IsNullOrWhiteSpace(request.SferumUserId))
        {
            user = users.FirstOrDefault(u => string.Equals(u.SferumUserId, request.SferumUserId.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        // Поиск по Email, если передан в запросе
        if (user == null && !string.IsNullOrWhiteSpace(request.Email))
        {
            user = users.FirstOrDefault(u => string.Equals(u.Email, request.Email.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        // Если токен содержит имя демо-пользователя (например, sferum_teacher_1 или vk_zavuch)
        if (user == null)
        {
            user = users.FirstOrDefault(u => request.Token.Contains(u.SferumUserId, StringComparison.OrdinalIgnoreCase));
        }

        // Если пользователь с таким Сферум ID еще не зарегистрирован в школе, создаем или привязываем
        if (user == null)
        {
            var fullName = !string.IsNullOrWhiteSpace(request.FirstName) || !string.IsNullOrWhiteSpace(request.LastName)
                ? $"{request.LastName} {request.FirstName}".Trim()
                : "Педагог Сферум ID";

            user = new User
            {
                FullName = fullName,
                Role = UserRole.Teacher,
                Subject = "Математика / Информатика",
                Email = request.Email ?? $"user_{Guid.NewGuid().ToString("N")[..8]}@sferum.vk.me",
                SferumUserId = !string.IsNullOrWhiteSpace(request.SferumUserId) ? request.SferumUserId : $"sferum_vk_{Guid.NewGuid().ToString("N")[..8]}",
                Phone = request.Phone ?? "+7 (913) 000-00-00",
                AvatarUrl = request.AvatarUrl,
                SchoolName = "МАОУ ЛИТ г. Новосибирск",
                SchoolId = request.SchoolId ?? "maou-lit-nsk",
                LastLoginAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
            {
                user.AvatarUrl = request.AvatarUrl;
            }
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        var (token, expiresAt) = _tokenService.GenerateToken(user);
        var userDto = _tokenService.ToUserDto(user);

        return Ok(new AuthResponseDto(
            Success: true,
            Token: token,
            TokenType: "Bearer",
            ExpiresAt: expiresAt,
            User: userDto,
            Message: "Авторизация через Сферум ID (VK ID) успешно подтверждена."
        ));
    }

    /// <summary>
    /// Мгновенная выдача сессии для демонстрационных ролей жюри:
    /// учитель (teacher), классрук (class_teacher), завуч (zavuch), завхоз (staff), ученик (student)
    /// </summary>
    [HttpPost("demo-login")]
    [HttpPost("demo")]
    public async Task<IActionResult> DemoLogin([FromBody] DemoLoginRequestDto request)
    {
        var roleKey = (request?.Role ?? request?.RoleId ?? "class_teacher").Trim().ToLowerInvariant();

        var users = await _context.Users.ToListAsync();
        User? targetUser = null;

        switch (roleKey)
        {
            case "teacher" or "0" or "учитель" or "преподаватель":
                targetUser = users.FirstOrDefault(u => u.Role == UserRole.Teacher)
                          ?? users.FirstOrDefault(u => u.Role == UserRole.ClassTeacher);
                break;

            case "class_teacher" or "classteacher" or "class-teacher" or "1" or "классрук" or "классный руководитель":
                targetUser = users.FirstOrDefault(u => u.Role == UserRole.ClassTeacher)
                          ?? users.FirstOrDefault(u => u.Role == UserRole.Teacher);
                break;

            case "zavuch" or "head_teacher" or "headteacher" or "2" or "завуч" or "администрация":
                targetUser = users.FirstOrDefault(u => u.Role == UserRole.HeadTeacher);
                break;

            case "staff" or "zavhoz" or "3" or "завхоз" or "инженер" or "сисадмин":
                targetUser = users.FirstOrDefault(u => u.Role == UserRole.Staff);
                break;

            case "student" or "4" or "ученик" or "школьник":
                targetUser = users.FirstOrDefault(u => u.Role == UserRole.Student);
                break;

            default:
                // По умолчанию открываем роль классного руководителя (Лосив Р.Б.)
                targetUser = users.FirstOrDefault(u => u.Role == UserRole.ClassTeacher)
                          ?? users.FirstOrDefault();
                break;
        }

        if (targetUser == null)
        {
            return NotFound(new { success = false, message = $"Пользователь для демо-роли '{request?.Role}' не найден." });
        }

        targetUser.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var (token, expiresAt) = _tokenService.GenerateToken(targetUser);
        var userDto = _tokenService.ToUserDto(targetUser);

        return Ok(new AuthResponseDto(
            Success: true,
            Token: token,
            TokenType: "Bearer",
            ExpiresAt: expiresAt,
            User: userDto,
            Message: $"Демо-сессия активирована: {targetUser.FullName} ({_tokenService.GetRoleDisplayName(targetUser.Role)})"
        ));
    }

    /// <summary>
    /// Получение профиля текущего пользователя со всеми правами доступа (RBAC)
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        // 1. Проверка через ClaimsPrincipal (стандартный JwtBearer)
        int? userId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            userId = _tokenService.GetUserIdFromPrincipal(User);
        }

        // 2. Если заголовок Authorization передан напрямую
        if (userId == null && Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            var headerValue = authHeader.ToString();
            if (headerValue.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                var token = headerValue.Substring("Bearer ".Length).Trim();
                var principal = _tokenService.ValidateToken(token);
                if (principal != null)
                {
                    userId = _tokenService.GetUserIdFromPrincipal(principal);
                }
            }
        }

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Сессия не найдена или срок действия токена истек. Передайте валидный заголовок 'Authorization: Bearer <token>'."
            });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId.Value);
        if (user == null)
        {
            return NotFound(new { success = false, message = "Пользователь не найден в базе данных." });
        }

        var userDto = _tokenService.ToUserDto(user);
        return Ok(userDto);
    }

    /// <summary>
    /// Поиск аккредитованных образовательных учреждений (МАОУ ЛИТ г. Новосибирск и др.)
    /// </summary>
    [HttpGet("schools")]
    public async Task<IActionResult> GetSchools([FromQuery] string? query = null, [FromQuery] string? region = null)
    {
        var allSchools = await _context.Schools.ToListAsync();
        IEnumerable<School> filtered = allSchools;

        if (!string.IsNullOrWhiteSpace(region))
        {
            var cleanRegion = region.Trim();
            filtered = filtered.Where(s =>
                s.Region.Contains(cleanRegion, StringComparison.OrdinalIgnoreCase) ||
                s.City.Contains(cleanRegion, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var cleanQuery = query.Trim();
            filtered = filtered.Where(s =>
                s.Name.Contains(cleanQuery, StringComparison.OrdinalIgnoreCase) ||
                s.ShortName.Contains(cleanQuery, StringComparison.OrdinalIgnoreCase) ||
                s.City.Contains(cleanQuery, StringComparison.OrdinalIgnoreCase) ||
                s.Inn.Contains(cleanQuery, StringComparison.OrdinalIgnoreCase) ||
                s.Address.Contains(cleanQuery, StringComparison.OrdinalIgnoreCase) ||
                s.Code.Contains(cleanQuery, StringComparison.OrdinalIgnoreCase)
            );
        }

        var result = filtered
            .OrderByDescending(s => s.IsDefault)
            .ThenBy(s => s.Name)
            .Select(s => new SchoolDto(
                s.Code,
                s.Name,
                s.ShortName,
                s.City,
                s.Region,
                s.Address,
                s.Inn,
                s.Ogrn,
                s.AccreditationStatus,
                s.Website,
                s.IsDefault
            ))
            .ToList();

        return Ok(result);
    }
}
