using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SferumCabinet.Api.Data;
using SferumCabinet.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Конфигурация базы данных: по умолчанию локальный SQLite для бесшовного запуска каркаса, с поддержкой MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var useMySql = builder.Configuration.GetValue<bool>("UseMySql", false);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (useMySql && !string.IsNullOrEmpty(connectionString))
    {
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
    }
    else
    {
        options.UseSqlite("Data Source=sferum_cabinet.db");
    }
});

// 2. Сервисы
builder.Services.AddHttpClient();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<PdfArchiveService>();
builder.Services.AddScoped<BoardVisionService>();
builder.Services.AddScoped<GeminiAiService>();

// 2.1 Настройка JWT Bearer аутентификации (.NET 10 Security)
var jwtKey = builder.Configuration["Jwt:Key"] ?? "SferumCabinet_Super_Secret_Key_2026_Auth_Bearer_Token_Signing_Key_MaouLit_Novosibirsk";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "SferumCabinet.Api";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "SferumCabinet.Client";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.FromMinutes(5)
    };
});
builder.Services.AddAuthorization();

// 3. CORS для локального Vite (localhost:5173) и Cloudflare туннелей (*.trycloudflare.com)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.Configure<RouteOptions>(options =>
{
    options.LowercaseUrls = true;
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

// Инициализация базы данных и сидинг эталонными школьными данными
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    DbInitializer.Initialize(db);
}

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Главный проверочный эндпоинт
app.MapGet("/", () => Results.Ok(new
{
    name = "СФЕРУМ.КАБИНЕТ API Core",
    version = "1.0.0-preview",
    stack = ".NET 10 + EF Core + Cloudflare Ready",
    docs = "/openapi/v1.json",
    health = "/api/system/status"
}));

app.Run();
