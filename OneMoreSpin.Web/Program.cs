using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Model.DataModels;
using System.Text;
using Microsoft.AspNetCore.Identity.UI.Services;
using OneMoreSpin.Services.Email;
namespace OneMoreSpin.Web;

public class Program
{
    public static void Main(string[] args)
    {
        DotNetEnv.Env.Load();
        var builder = WebApplication.CreateBuilder();

        // --- Database (PostgreSQL) ---
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
            options.UseLazyLoadingProxies();
        });

        // --- Identity ---
        builder.Services.AddIdentity<User, Role>(opt =>
        {
            opt.User.RequireUniqueEmail = true;
            opt.SignIn.RequireConfirmedEmail = true;
            opt.Password.RequiredLength = 6;
            opt.Password.RequireDigit = true;
            opt.Password.RequireLowercase = true;
            opt.Password.RequireUppercase = false;
            opt.Password.RequireNonAlphanumeric = false;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();
      
        // --- JWT ---
        var jwtKey = builder.Configuration["Jwt:Key"] ?? "super_secret_dev_key_change_this";
        var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "onemorespin.local";

        builder.Services
            .AddAuthentication(o =>
            {
                o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(o =>
            {
                o.RequireHttpsMetadata = false; // DEV; w PROD -> true
                o.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtIssuer,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });

        // --- Email Sender ---
        builder.Services.Configure<EmailSenderOptions>(builder.Configuration.GetSection("EmailSender"));
        builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();

        // --- MVC / Swagger / CORS ---
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddCors(opt =>
        {
            opt.AddPolicy("SpaDev", p => p
                .WithOrigins("http://localhost:5173", "http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials());
        });

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseCors("SpaDev");
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        app.Run();
    }
}
