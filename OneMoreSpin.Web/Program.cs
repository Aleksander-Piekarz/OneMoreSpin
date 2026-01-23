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
using OneMoreSpin.Services.Hubs;
using OneMoreSpin.Services.Interfaces;
using OneMoreSpin.Web.Middleware;
using Stripe;

namespace OneMoreSpin.Web;

public class Program
{
    public static void Main(string[] args)
    {
        DotNetEnv.Env.Load();
        var builder = WebApplication.CreateBuilder(args);
        builder.Configuration.AddEnvironmentVariables();

        StripeConfiguration.ApiKey =
            Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY")
            ?? builder.Configuration["Stripe:SecretKey"];

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
            options.UseLazyLoadingProxies();
        });

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

        var jwtKey = builder.Configuration["Jwt:Key"] ?? "super_secret_dev_key_change_this";
        var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "onemorespin.local";
        var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "onemorespin.local";

        builder
            .Services.AddAuthentication(o =>
            {
                o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                o.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        if (
                            !string.IsNullOrEmpty(accessToken)
                            && (
                                path.StartsWithSegments("/pokerHub")
                                || path.StartsWithSegments("/blackjackHub")
                                || path.StartsWithSegments("/rouletteHub")
                            )
                        )
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    },
                };
            });


        builder.Services.Configure<EmailSenderOptions>(
            builder.Configuration.GetSection("EmailSender")
        );
        builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();
        builder.Services.AddSignalR()
            .AddJsonProtocol(options =>
            {
                options.PayloadSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                options.PayloadSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.Never;
            });
        builder.Services.AddSingleton<IPokerService, PokerService>();
        builder.Services.AddSingleton<IMultiplayerBlackjackService, MultiplayerBlackjackService>();

        builder
            .Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            });

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "OneMoreSpin API", Version = "v1" });
            var jwtScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter 'Bearer' [space] and then your JWT token.",
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
        builder.Services.AddScoped<IRewardService, RewardService>();
        builder.Services.AddScoped<IMissionService, MissionService>();
        builder.Services.AddScoped<ISlotService, SlotService>();
        builder.Services.AddScoped<IRouletteService, RouletteService>();
        builder.Services.AddScoped<IBlackjackService, BlackjackService>();
        builder.Services.AddScoped<ISinglePokerService, SinglePokerService>();
        builder.Services.AddScoped<IAdminService, AdminService>();
        builder.Services.AddHostedService<MissionResetService>();
        builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();

        builder.Services.AddCors(opt =>
        {
            opt.AddPolicy(
                "SpaDev",
                p =>
                    p.SetIsOriginAllowed(origin => true)
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

        app.UseRouting();

        app.UseCors("SpaDev");

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseLastSeen();

        app.UseStaticFiles();

        app.MapControllers();
        app.MapHub<PokerHub>("/pokerHub");
        app.MapHub<BlackjackHub>("/blackjackHub");

        app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");

        app.MapFallbackToFile("index.html");

        app.Run();
    }
}
