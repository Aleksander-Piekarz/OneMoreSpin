using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using OneMoreSpin.Model.DataModels;

namespace OneMoreSpin.Web.Middleware;

public class LastSeenMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly TimeSpan UpdateInterval = TimeSpan.FromMinutes(1);

    public LastSeenMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, UserManager<User> userManager)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var userId))
            {
                var user = await userManager.FindByIdAsync(userId.ToString());
                if (user != null)
                {
                    if (!user.LastSeenAt.HasValue || DateTime.UtcNow - user.LastSeenAt.Value > UpdateInterval)
                    {
                        user.LastSeenAt = DateTime.UtcNow;
                        await userManager.UpdateAsync(user);
                    }
                }
            }
        }

        await _next(context);
    }
}

public static class LastSeenMiddlewareExtensions
{
    public static IApplicationBuilder UseLastSeen(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<LastSeenMiddleware>();
    }
}
