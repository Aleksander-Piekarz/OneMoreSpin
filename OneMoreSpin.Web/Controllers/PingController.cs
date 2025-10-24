using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace OneMoreSpin.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PingController : ControllerBase
{
    [HttpGet("public")]
    public IActionResult Public() => Ok(new { pong = "public" });

    [Authorize]
    [HttpGet("secure")]
    public IActionResult Secure() => Ok(new { pong = "secure" });
}
