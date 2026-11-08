using Microsoft.EntityFrameworkCore;
using SferumCabinet.Api.Models;

namespace SferumCabinet.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Classroom> Classrooms => Set<Classroom>();
    public DbSet<ScheduleSlot> ScheduleSlots => Set<ScheduleSlot>();
    public DbSet<StudentStatement> Statements => Set<StudentStatement>();
    public DbSet<MaintenanceTicket> Tickets => Set<MaintenanceTicket>();
    public DbSet<AcademicDebt> AcademicDebts => Set<AcademicDebt>();
    public DbSet<KnowledgeCard> KnowledgeCards => Set<KnowledgeCard>();
    public DbSet<School> Schools => Set<School>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<School>()
            .HasIndex(s => s.Code)
            .IsUnique();

        modelBuilder.Entity<Classroom>()
            .HasIndex(c => c.Number)
            .IsUnique();

        modelBuilder.Entity<ScheduleSlot>()
            .HasIndex(s => new { s.DayOfWeek, s.LessonNumber, s.ClassroomNumber });
    }
}
