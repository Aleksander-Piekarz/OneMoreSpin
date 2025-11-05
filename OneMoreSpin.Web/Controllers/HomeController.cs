using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using OneMoreSpin.Web.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.ViewModels.VM;

namespace OneMoreSpin.Web.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;

    public HomeController(
        ILogger<HomeController> logger,
        ApplicationDbContext context,
        IWebHostEnvironment env
    )
    {
        _logger = logger;
        _context = context;
        _env = env;
    }

    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteAllUsers()
    {
        // Zabezpieczenie: endpoint dostępny tylko w środowisku developerskim
        if (!_env.IsDevelopment())
        {
            return Forbid();
        }

        // Wyczyść wszystkich użytkowników i powiązane rekordy Identity w PostgreSQL
        _context.Database.ExecuteSqlRaw("TRUNCATE TABLE \"AspNetUsers\" CASCADE;");
        return Content("Wszyscy użytkownicy zostali usunięci.");
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
