using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OneMoreSpin.DAL.Migrations
{
    /// <inheritdoc />
    public partial class dodanie_opis_eng : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DescriptionEn",
                table: "Missions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DescriptionEn",
                table: "Missions");
        }
    }
}
