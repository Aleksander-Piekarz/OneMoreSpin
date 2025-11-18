using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OneMoreSpin.DAL.Migrations
{
    /// <inheritdoc />
    public partial class added_daily_streak : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DailyStreak",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DailyStreak",
                table: "AspNetUsers");
        }
    }
}
