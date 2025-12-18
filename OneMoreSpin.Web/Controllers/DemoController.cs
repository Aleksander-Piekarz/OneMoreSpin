using Microsoft.AspNetCore.Mvc;
namespace OneMoreSpin.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DemoController : ControllerBase
{
    private readonly Random _rnd = new Random();

    [HttpPost("slots")]
    public IActionResult Slots([FromBody] BetRequest req) => NotFound();

    [HttpPost("roulette")]
    public IActionResult Roulette([FromBody] BetRequest req) => NotFound();

    [HttpPost("blackjack")]
    public IActionResult Blackjack([FromBody] BetRequest req) => NotFound();

    [HttpPost("poker")]
    public IActionResult Poker([FromBody] BetRequest req) => NotFound();

    public class BetRequest
    {
        public decimal BetAmount { get; set; }
    }
}
