using Microsoft.EntityFrameworkCore;
using SferumCabinet.Api.Models;

namespace SferumCabinet.Api.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        context.Database.EnsureCreated();

        // 0. Бесшовная миграция схемы для существующих SQLite баз данных
        try
        {
            if (context.Database.IsSqlite())
            {
                var conn = context.Database.GetDbConnection();
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "PRAGMA table_info(Users);";
                    using var reader = cmd.ExecuteReader();
                    var cols = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    while (reader.Read())
                    {
                        cols.Add(reader.GetString(1));
                    }
                    reader.Close();

                    if (!cols.Contains("Snils"))
                    {
                        cmd.CommandText = "ALTER TABLE Users ADD COLUMN Snils TEXT NULL;";
                        cmd.ExecuteNonQuery();
                    }
                    if (!cols.Contains("PasswordHash"))
                    {
                        cmd.CommandText = "ALTER TABLE Users ADD COLUMN PasswordHash TEXT NULL;";
                        cmd.ExecuteNonQuery();
                    }
                    if (!cols.Contains("PasswordSalt"))
                    {
                        cmd.CommandText = "ALTER TABLE Users ADD COLUMN PasswordSalt TEXT NULL;";
                        cmd.ExecuteNonQuery();
                    }
                    if (!cols.Contains("Phone"))
                    {
                        cmd.CommandText = "ALTER TABLE Users ADD COLUMN Phone TEXT NULL;";
                        cmd.ExecuteNonQuery();
                    }
                    if (!cols.Contains("SchoolName"))
                    {
                        cmd.CommandText = "ALTER TABLE Users ADD COLUMN SchoolName TEXT NOT NULL DEFAULT 'МАОУ ЛИТ г. Новосибирск';";
                        cmd.ExecuteNonQuery();
                    }
                    if (!cols.Contains("SchoolId"))
                    {
                        cmd.CommandText = "ALTER TABLE Users ADD COLUMN SchoolId TEXT NOT NULL DEFAULT 'maou-lit-nsk';";
                        cmd.ExecuteNonQuery();
                    }
                    if (!cols.Contains("LastLoginAt"))
                    {
                        cmd.CommandText = "ALTER TABLE Users ADD COLUMN LastLoginAt TEXT NULL;";
                        cmd.ExecuteNonQuery();
                    }
                    if (!cols.Contains("AvatarUrl"))
                    {
                        cmd.CommandText = "ALTER TABLE Users ADD COLUMN AvatarUrl TEXT NULL;";
                        cmd.ExecuteNonQuery();
                    }

                    // Создание таблицы Schools если еще не существует
                    cmd.CommandText = @"
                    CREATE TABLE IF NOT EXISTS ""Schools"" (
                        ""Id"" INTEGER NOT NULL CONSTRAINT ""PK_Schools"" PRIMARY KEY AUTOINCREMENT,
                        ""Code"" TEXT NOT NULL,
                        ""Name"" TEXT NOT NULL,
                        ""ShortName"" TEXT NOT NULL,
                        ""City"" TEXT NOT NULL,
                        ""Region"" TEXT NOT NULL,
                        ""Address"" TEXT NOT NULL,
                        ""Inn"" TEXT NOT NULL,
                        ""Ogrn"" TEXT NOT NULL,
                        ""AccreditationStatus"" TEXT NOT NULL,
                        ""Website"" TEXT NOT NULL,
                        ""IsDefault"" INTEGER NOT NULL DEFAULT 0
                    );
                    CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Schools_Code"" ON ""Schools"" (""Code"");
                    ";
                    cmd.ExecuteNonQuery();
                }
                conn.Close();
            }
        }
        catch
        {
            // Обработка повторного запуска или стороннего провайдера
        }

        // 0.1 Инициализация реестра аккредитованных образовательных учреждений
        if (!context.Schools.Any())
        {
            var schools = new List<School>
            {
                new()
                {
                    Code = "maou-lit-nsk",
                    Name = "МАОУ «Лицей Информационных Технологий»",
                    ShortName = "МАОУ ЛИТ г. Новосибирск",
                    City = "г. Новосибирск",
                    Region = "Новосибирская область",
                    Address = "ул. Римского-Корсакова, 13",
                    Inn = "5404128912",
                    Ogrn = "1025401498123",
                    AccreditationStatus = "Государственная аккредитация № 1582 (Действует, бессрочно)",
                    Website = "https://lit.nios.ru",
                    IsDefault = true
                },
                new()
                {
                    Code = "gimnaziya-1-nsk",
                    Name = "МАОУ «Гимназия № 1»",
                    ShortName = "Гимназия № 1 г. Новосибирск",
                    City = "г. Новосибирск",
                    Region = "Новосибирская область",
                    Address = "Красный проспект, 48",
                    Inn = "5406113941",
                    Ogrn = "1025402481029",
                    AccreditationStatus = "Государственная аккредитация № 2104 (Действует)",
                    Website = "https://gimn1nsk.ru",
                    IsDefault = false
                },
                new()
                {
                    Code = "sunc-ngu-nsk",
                    Name = "СУНЦ НГУ (Физико-математическая школа им. М.А. Лаврентьева)",
                    ShortName = "СУНЦ НГУ (ФМШ) г. Новосибирск",
                    City = "г. Новосибирск",
                    Region = "Новосибирская область",
                    Address = "ул. Ляпунова, 3",
                    Inn = "5408106948",
                    Ogrn = "1025403652190",
                    AccreditationStatus = "Федеральная аккредитация при НГУ (Действует)",
                    Website = "https://sesc.nsu.ru",
                    IsDefault = false
                },
                new()
                {
                    Code = "licey-130-nsk",
                    Name = "МБОУ «Лицей № 130 имени академика М.А. Лаврентьева»",
                    ShortName = "Лицей № 130 г. Новосибирск (Академгородок)",
                    City = "г. Новосибирск",
                    Region = "Новосибирская область",
                    Address = "ул. Ученых, 10",
                    Inn = "5408107780",
                    Ogrn = "1025403658821",
                    AccreditationStatus = "Государственная аккредитация № 1731 (Действует)",
                    Website = "https://lyceum130.ru",
                    IsDefault = false
                },
                new()
                {
                    Code = "vtoraya-gimnaziya-nsk",
                    Name = "МБОУ «Вторая Новосибирская Гимназия»",
                    ShortName = "Вторая Новосибирская Гимназия",
                    City = "г. Новосибирск",
                    Region = "Новосибирская область",
                    Address = "ул. Пархоменко, 2",
                    Inn = "5404104231",
                    Ogrn = "1025401490210",
                    AccreditationStatus = "Государственная аккредитация № 1928 (Действует)",
                    Website = "https://2gimnaziya.edusite.ru",
                    IsDefault = false
                },
                new()
                {
                    Code = "fml-239-spb",
                    Name = "ГБОУ «Президентский физико-математический лицей № 239»",
                    ShortName = "Президентский ФМЛ № 239 г. Санкт-Петербург",
                    City = "г. Санкт-Петербург",
                    Region = "г. Санкт-Петербург",
                    Address = "ул. Кирочная, 8",
                    Inn = "7808031201",
                    Ogrn = "1027809221019",
                    AccreditationStatus = "Федеральная аккредитация (Действует)",
                    Website = "https://239.ru",
                    IsDefault = false
                },
                new()
                {
                    Code = "school-57-msk",
                    Name = "ГБОУ «Пятьдесят седьмая школа» (Школа № 57)",
                    ShortName = "Школа № 57 г. Москва",
                    City = "г. Москва",
                    Region = "г. Москва",
                    Address = "Малый Знаменский пер., 7/10",
                    Inn = "7704049811",
                    Ogrn = "1027739501822",
                    AccreditationStatus = "Государственная аккредитация (Действует)",
                    Website = "https://sch57.mskobr.ru",
                    IsDefault = false
                }
            };
            context.Schools.AddRange(schools);
            context.SaveChanges();
        }

        // 1. Пользователи школы (Ролевая модель)
        if (context.Users.Any())
        {
            // Обновление существующих пользователей дополнительными атрибутами профиля и безопасности
            var existingUsers = context.Users.ToList();
            foreach (var u in existingUsers)
            {
                if (string.IsNullOrEmpty(u.SchoolName))
                {
                    u.SchoolName = "МАОУ ЛИТ г. Новосибирск";
                    u.SchoolId = "maou-lit-nsk";
                }
                if (string.IsNullOrEmpty(u.Snils))
                {
                    u.Snils = u.Role switch
                    {
                        UserRole.ClassTeacher => "112-233-445 95",
                        UserRole.HeadTeacher => "154-890-123 44",
                        UserRole.Staff => "178-901-234 55",
                        UserRole.Teacher => "201-345-678 01",
                        UserRole.Student => "199-888-777 66",
                        _ => "111-222-333 44"
                    };
                }
                if (string.IsNullOrEmpty(u.Phone))
                {
                    u.Phone = u.Role switch
                    {
                        UserRole.ClassTeacher => "+7 (913) 912-34-56",
                        UserRole.HeadTeacher => "+7 (913) 923-45-67",
                        UserRole.Staff => "+7 (913) 934-56-78",
                        UserRole.Teacher => "+7 (913) 945-67-89",
                        UserRole.Student => "+7 (913) 956-78-90",
                        _ => "+7 (913) 000-00-00"
                    };
                }
                if (string.IsNullOrEmpty(u.PasswordHash))
                {
                    u.PasswordSalt = "8kL0xV3P7a9mQ2bF4rY==";
                    u.PasswordHash = "vQ98d+FvTqB7Z1pXyH4m==";
                }
            }
            context.SaveChanges();
            return; // Основные сущности уже в БД
        }

        var users = new List<User>
        {
            new()
            {
                FullName = "Лосив Роман Борисович",
                Role = UserRole.ClassTeacher,
                Subject = "Математика / Информатика",
                AssignedClass = "9А",
                Email = "losiv@maou-lit.ru",
                Snils = "112-233-445 95",
                Phone = "+7 (913) 912-34-56",
                SferumUserId = "sferum_teacher_1",
                SchoolName = "МАОУ ЛИТ г. Новосибирск",
                SchoolId = "maou-lit-nsk"
            },
            new()
            {
                FullName = "Громова Александра Сергеевна",
                Role = UserRole.HeadTeacher,
                Subject = "Завуч по УВР",
                AssignedClass = null,
                Email = "gromova@maou-lit.ru",
                Snils = "154-890-123 44",
                Phone = "+7 (913) 923-45-67",
                SferumUserId = "sferum_zavuch_1",
                SchoolName = "МАОУ ЛИТ г. Новосибирск",
                SchoolId = "maou-lit-nsk"
            },
            new()
            {
                FullName = "Сидоров Виктор Павлович",
                Role = UserRole.Staff,
                Subject = "Завхоз / Инженер",
                AssignedClass = null,
                Email = "sidorov@maou-lit.ru",
                Snils = "178-901-234 55",
                Phone = "+7 (913) 934-56-78",
                SferumUserId = "sferum_staff_1",
                SchoolName = "МАОУ ЛИТ г. Новосибирск",
                SchoolId = "maou-lit-nsk"
            },
            new()
            {
                FullName = "Семенов Михаил Юрьевич",
                Role = UserRole.Teacher,
                Subject = "Физика",
                AssignedClass = null,
                Email = "semenov@maou-lit.ru",
                Snils = "201-345-678 01",
                Phone = "+7 (913) 945-67-89",
                SferumUserId = "sferum_teacher_2",
                SchoolName = "МАОУ ЛИТ г. Новосибирск",
                SchoolId = "maou-lit-nsk"
            },
            new()
            {
                FullName = "Иванов Иван",
                Role = UserRole.Student,
                Subject = "Ученик",
                AssignedClass = "9А",
                Email = "ivanov@lit.ru",
                Snils = "199-888-777 66",
                Phone = "+7 (913) 956-78-90",
                SferumUserId = "sferum_student_1",
                SchoolName = "МАОУ ЛИТ г. Новосибирск",
                SchoolId = "maou-lit-nsk"
            }
        };
        context.Users.AddRange(users);
        context.SaveChanges();

        // 2. Кабинеты
        var classrooms = new List<Classroom>
        {
            new() { Number = "101", Floor = 1, Capacity = 28, Equipment = "Интерактивная панель Lumien, 1 ПК", Status = "Free" },
            new() { Number = "102", Floor = 1, Capacity = 26, Equipment = "Проектор Epson, Документ-камера", Status = "Occupied" },
            new() { Number = "204", Floor = 2, Capacity = 30, Equipment = "Медиакомплекс, Интерактивная доска", Status = "Occupied" },
            new() { Number = "305", Floor = 3, Capacity = 32, Equipment = "Проектор, Звуковая система", Status = "Free" },
            new() { Number = "311", Floor = 3, Capacity = 30, Equipment = "Интерактивная доска Smart, Проектор NEC, 1 ПК", Status = "Occupied", Notes = "Кабинет математики (Лосив Р.Б.)" },
            new() { Number = "302", Floor = 3, Capacity = 16, Equipment = "Лаборатория физики, 16 цифровых стендов", Status = "Occupied" },
            new() { Number = "315", Floor = 3, Capacity = 25, Equipment = "IT-полигон и робототехника, 18 рабочих мест", Status = "Free" }
        };
        context.Classrooms.AddRange(classrooms);
        context.SaveChanges();

        // 3. Расписание уроков («Сферум.Локатор») на сегодня (Понедельник / Вторник)
        var lessons = new List<ScheduleSlot>
        {
            // Кабинет 311
            new() { LessonNumber = 1, TimeStart = "08:30", TimeEnd = "09:15", DayOfWeek = DayOfWeek.Monday, ClassroomNumber = "311", ClassGrade = "8А", Subject = "Алгебра", TeacherName = "Лосив Роман Борисович", TeacherId = 1 },
            new() { LessonNumber = 2, TimeStart = "09:25", TimeEnd = "10:10", DayOfWeek = DayOfWeek.Monday, ClassroomNumber = "311", ClassGrade = "8Б", Subject = "Геометрия", TeacherName = "Лосив Роман Борисович", TeacherId = 1 },
            new() { LessonNumber = 3, TimeStart = "10:25", TimeEnd = "11:10", DayOfWeek = DayOfWeek.Monday, ClassroomNumber = "311", ClassGrade = "10А", Subject = "Информатика", TeacherName = "Лосив Роман Борисович", TeacherId = 1 },
            new() { LessonNumber = 4, TimeStart = "11:30", TimeEnd = "12:15", DayOfWeek = DayOfWeek.Monday, ClassroomNumber = "311", ClassGrade = "9А", Subject = "Геометрия", TeacherName = "Лосив Роман Борисович", TeacherId = 1 },
            new() { LessonNumber = 5, TimeStart = "12:35", TimeEnd = "13:20", DayOfWeek = DayOfWeek.Monday, ClassroomNumber = "311", ClassGrade = "11Б", Subject = "Алгебра и начала анализа", TeacherName = "Лосив Роман Борисович", TeacherId = 1 },
            // 6-й урок в 311 свободен для консультаций/пересдач!
            
            // Кабинет 204
            new() { LessonNumber = 3, TimeStart = "10:25", TimeEnd = "11:10", DayOfWeek = DayOfWeek.Monday, ClassroomNumber = "204", ClassGrade = "9А", Subject = "Русский язык", TeacherName = "Романова Е. В.", TeacherId = 2 },
            new() { LessonNumber = 4, TimeStart = "11:30", TimeEnd = "12:15", DayOfWeek = DayOfWeek.Monday, ClassroomNumber = "204", ClassGrade = "8Б", Subject = "Литература", TeacherName = "Романова Е. В.", TeacherId = 2 },
            
            // Кабинет 302 (Физика)
            new() { LessonNumber = 4, TimeStart = "11:30", TimeEnd = "12:15", DayOfWeek = DayOfWeek.Monday, ClassroomNumber = "302", ClassGrade = "10А", Subject = "Физика (Практикум)", TeacherName = "Семенов Михаил Юрьевич", TeacherId = 4 },
            new() { LessonNumber = 5, TimeStart = "12:35", TimeEnd = "13:20", DayOfWeek = DayOfWeek.Monday, ClassroomNumber = "302", ClassGrade = "9А", Subject = "Физика", TeacherName = "Семенов Михаил Юрьевич", TeacherId = 4 }
        };
        context.ScheduleSlots.AddRange(lessons);
        context.SaveChanges();

        // 4. Заявления родителей («Цифровая приемная»)
        var statements = new List<StudentStatement>
        {
            new()
            {
                StudentName = "Иванов Иван",
                ClassGrade = "9А",
                ParentName = "Иванова Ольга Николаевна",
                ParentPhone = "+7 (913) 456-78-90",
                StartDate = DateTime.Today.AddDays(-2),
                EndDate = DateTime.Today.AddDays(3),
                Reason = "Болезнь (ОРВИ)",
                Status = "SickLeaveActive",
                PhotoAttachmentUrl = "/uploads/statements/statement_ivanov.jpg",
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                Comment = "Справка от педиатра будет предоставлена в понедельник"
            },
            new()
            {
                StudentName = "Смирнова Анна",
                ClassGrade = "9А",
                ParentName = "Смирнов Андрей Павлович",
                ParentPhone = "+7 (913) 789-01-23",
                StartDate = DateTime.Today,
                EndDate = DateTime.Today.AddDays(1),
                Reason = "Семейные обстоятельства",
                Status = "Approved",
                PhotoAttachmentUrl = "/uploads/statements/statement_smirnova.jpg",
                CreatedAt = DateTime.UtcNow.AddHours(-12),
                Comment = "Поездка на медицинское обследование"
            },
            new()
            {
                StudentName = "Ковалев Дмитрий",
                ClassGrade = "9А",
                ParentName = "Ковалева Марина Игоревна",
                ParentPhone = "+7 (913) 321-65-43",
                StartDate = DateTime.Today.AddDays(-1),
                EndDate = DateTime.Today.AddDays(4),
                Reason = "Болезнь",
                Status = "SickLeaveActive",
                PhotoAttachmentUrl = "/uploads/statements/statement_kovalev.jpg",
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                Comment = "Температура 38.2, постельный режим"
            },
            new()
            {
                StudentName = "Петров Алексей",
                ClassGrade = "9А",
                ParentName = "Петров Сергей Викторович",
                ParentPhone = "+7 (913) 654-98-70",
                StartDate = DateTime.Today.AddDays(1),
                EndDate = DateTime.Today.AddDays(2),
                Reason = "Олимпиада (Всеросс Региональный этап)",
                Status = "Approved",
                PhotoAttachmentUrl = "/uploads/statements/statement_petrov.jpg",
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                Comment = "Участие во Всероссийской олимпиаде по физике"
            }
        };
        context.Statements.AddRange(statements);
        context.SaveChanges();

        // 5. SOS-Тикеты по кабинетам
        var tickets = new List<MaintenanceTicket>
        {
            new()
            {
                ClassroomNumber = "311",
                Category = "Проектор",
                Description = "Лампа проектора NEC периодически гаснет во время урока. Светодиод моргает красным.",
                Urgency = "High",
                Status = "Open",
                ReportedBy = "Лосив Р. Б.",
                ReportedAt = DateTime.UtcNow.AddHours(-2),
                PhotoUrl = "/uploads/tickets/ticket_projector_311.jpg"
            },
            new()
            {
                ClassroomNumber = "204",
                Category = "Мебель/Стул",
                Description = "У парты 2-го ряда слева шатается ножка стула. Требуется подтянуть крепеж.",
                Urgency = "Normal",
                Status = "InProgress",
                ReportedBy = "Романова Е. В.",
                ReportedAt = DateTime.UtcNow.AddDays(-1),
                ResolvedBy = "Сидоров В. П."
            },
            new()
            {
                ClassroomNumber = "102",
                Category = "ПК/Картридж",
                Description = "Закончился тонер в принтере HP LaserJet. Нужно заменить картридж для печати проверочных бланков.",
                Urgency = "Normal",
                Status = "Resolved",
                ReportedBy = "Семенов М. Ю.",
                ReportedAt = DateTime.UtcNow.AddDays(-2),
                ResolvedBy = "Сидоров В. П.",
                ResolvedAt = DateTime.UtcNow.AddHours(-4),
                ResolutionNotes = "Картридж 85A заменен на заправленный."
            }
        };
        context.Tickets.AddRange(tickets);
        context.SaveChanges();

        // 6. Академические задолженности («Анти-Хвост»)
        var debts = new List<AcademicDebt>
        {
            new()
            {
                StudentName = "Иванов Иван",
                ClassGrade = "9А",
                Subject = "Физика",
                AssignmentTitle = "Лабораторная работа №2 «Определение КПД наклонной плоскости»",
                DueDate = DateTime.Today.AddDays(-8),
                DebtType = "Не сдана работа",
                Status = "Pending",
                RetakeRoom = "311",
                RetakeLesson = "Вторник, 6 урок (13:30)",
                NotificationSent = true
            },
            new()
            {
                StudentName = "Сидоров Артем",
                ClassGrade = "9А",
                Subject = "Алгебра",
                AssignmentTitle = "Контрольная работа №1 «Квадратные корни и иррациональные уравнения»",
                DueDate = DateTime.Today.AddDays(-5),
                DebtType = "Двойка (неудовл.)",
                Status = "Pending",
                RetakeRoom = "311",
                RetakeLesson = "Среда, 6 урок (13:30)",
                NotificationSent = false
            },
            new()
            {
                StudentName = "Кузнецов Егор",
                ClassGrade = "9А",
                Subject = "Геометрия",
                AssignmentTitle = "Теоретический зачет «Теорема Пифагора и пропорциональные отрезки»",
                DueDate = DateTime.Today.AddDays(-12),
                DebtType = "Пропуск зачета",
                Status = "Pending",
                RetakeRoom = "311",
                RetakeLesson = "Четверг, 7 урок (14:20)",
                NotificationSent = true
            }
        };
        context.AcademicDebts.AddRange(debts);
        context.SaveChanges();
    }
}
