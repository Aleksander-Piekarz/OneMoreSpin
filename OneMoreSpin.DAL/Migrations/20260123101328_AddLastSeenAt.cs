using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OneMoreSpin.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddLastSeenAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastSeenAt",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastSeenAt",
                table: "AspNetUsers");
        }
    }
}
