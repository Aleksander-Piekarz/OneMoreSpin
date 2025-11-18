using System.Text;
using System.Text.Json.Serialization;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OneMoreSpin.DAL.EF;
using OneMoreSpin.Model.DataModels;
using OneMoreSpin.Services.ConcreteServices;
using OneMoreSpin.Services.Configuration.AutoMapperProfiles;
using OneMoreSpin.Services.Email;
using OneMoreSpin.Services.Interfaces;
using Stripe;

namespace OneMoreSpin.Web;

public class Program
{
    public static void Main(string[] args)
    {
        DotNetEnv.Env.Load(); // Ładowanie zmiennych
        var builder = WebApplication.CreateBuilder(args); // Budowanie konfiguracji
        builder.Configuration.AddEnvironmentVariables(); // Dodanie zmiennych środowiskowych do konfiguracji
        StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY") 
            ?? builder.Configuration["Stripe:SecretKey"]; // Użycie konfiguracji Stripe

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
            options.UseLazyLoadingProxies();
        });

        // --- Identity ---
        builder
            .Services.AddIdentity<User, Role>(opt =>
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

        builder
            .Services.AddAuthentication(o =>
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
                    ClockSkew = TimeSpan.FromMinutes(1),
                };
            });

        // --- Email Sender ---
        builder.Services.Configure<EmailSenderOptions>(
            builder.Configuration.GetSection("EmailSender")
        );
        builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();

        // --- MVC / Swagger / CORS ---
        builder.Services.AddControllers().AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        });
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "OneMoreSpin API", Version = "v1" });

            // JWT Bearer
            var jwtScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description =
                    "Enter 'Bearer' [space] and then your JWT token.\n\nExample: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            };

            options.AddSecurityDefinition("Bearer", jwtScheme);

            options.AddSecurityRequirement(
                new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer",
                            },
                        },
                        new string[] { }
                    },
                }
            );
        });
        builder.Services.AddScoped<ISlotService, SlotService>();
        builder.Services.AddScoped<IGameService, GameService>();
        builder.Services.AddAutoMapper(typeof(MainProfile));
        builder.Services.AddScoped<IProfileService, ProfileService>();
        builder.Services.AddScoped<IPaymentService, PaymentService>();
        builder.Services.AddScoped<IGameService, GameService>();
        builder.Services.AddScoped<IRewardService, RewardService>();
        builder.Services.AddScoped<IMissionService, MissionService>();
        builder.Services.AddScoped<ISlotService, SlotService>();
        builder.Services.AddHostedService<MissionResetService>();
        builder.Services.AddCors(opt =>
        {
            opt.AddPolicy(
                "SpaDev",
                p =>
                    p.WithOrigins("http://localhost:5173", "http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
            );
        });

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }
        app.UseCors("SpaDev");
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        app.Run();
    }
}
