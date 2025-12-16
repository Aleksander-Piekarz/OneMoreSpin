using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    private async Task<int?> GetCurrentUserIdAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return null;

        if (!await _adminService.IsUserAdminAsync(userId))
            return null;

        return userId;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var adminId = await GetCurrentUserIdAsync();
        if (adminId == null)
            return Forbid();

        var result = await _adminService.GetAllUsersAsync(page, pageSize);
        return Ok(result);
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var adminId = await GetCurrentUserIdAsync();
        if (adminId == null)
            return Forbid();

        var user = await _adminService.GetUserByIdAsync(id);
        if (user == null)
            return NotFound(new { error = "User not found" });

        return Ok(user);
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var adminId = await GetCurrentUserIdAsync();
        if (adminId == null)
            return Forbid();

        var result = await _adminService.DeleteUserAsync(id, adminId.Value);
        if (!result)
            return BadRequest(new { error = "Failed to delete user" });

        return Ok(new { message = "User deleted successfully" });
    }

    [HttpPut("users/{id}/balance")]
    public async Task<IActionResult> UpdateUserBalance(int id, [FromBody] decimal balance)
    {
        var adminId = await GetCurrentUserIdAsync();
        if (adminId == null)
            return Forbid();

        var result = await _adminService.UpdateUserBalanceAsync(id, balance, adminId.Value);
        if (!result)
            return BadRequest(new { error = "Failed to update balance" });

        return Ok(new { message = "Balance updated successfully" });
    }
}
