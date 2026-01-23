using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OneMoreSpin.Services.Interfaces;
using Stripe; 
using Stripe.Checkout;

using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OneMoreSpin.Web.Controllers
{
    /// <summary>
    /// Kontroler obsługujący płatności przez Stripe.
    /// Endpointy: tworzenie sesji Checkout (wpłata), webhook Stripe, wypłaty, historia płatności.
    /// Integruje się z Stripe API do bezpiecznego przetwarzania płatności.
    /// </summary>
    [Authorize] 
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentController> _logger;
        
        private readonly string _clientUrl;
        private readonly string? _webhookSecret;

        public class CreateCheckoutRequest
        {
            public decimal Amount { get; set; }
        }

        public class CreateWithdrawalRequest
        {
            public decimal Amount { get; set; }
        }

        public PaymentController(
            IPaymentService paymentService,
            ILogger<PaymentController> logger,
            IConfiguration config) 
        {
            _paymentService = paymentService;
            _logger = logger;

            var envUrl = Environment.GetEnvironmentVariable("CLIENT_URL");
            _clientUrl = !string.IsNullOrEmpty(envUrl) ? envUrl : "http://91.123.188.186:5173";

            _logger.LogInformation($"[PAYMENT CONFIG] CLIENT_URL z PM2: '{envUrl}'. Używam adresu: '{_clientUrl}'");

            
            _webhookSecret = Environment.GetEnvironmentVariable("STRIPE_WEBHOOK_SECRET") ?? config["Stripe:WebhookSecret"];
        }

        
        [HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card", "p24", "blik" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "pln",
                            UnitAmount = (long)(request.Amount * 100),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = "Doładowanie portfela OneMoreSpin"
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                ClientReferenceId = userId, 
                SuccessUrl = $"{_clientUrl}/profile?payment=success",
                CancelUrl = $"{_clientUrl}/profile?payment=cancel",
            };

            try
            {
                var service = new SessionService();
                Session session = await service.CreateAsync(options);
                return Ok(new { url = session.Url });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Błąd podczas tworzenia sesji Stripe");
                return BadRequest(new { message = e.Message });
            }
        }

        [HttpPost("withdraw")]
        public async Task<IActionResult> CreateWithdrawal([FromBody] CreateWithdrawalRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            if (request.Amount <= 0)
            {
                return BadRequest(new { message = "Kwota wypłaty musi być dodatnia." });
            }

            try
            {
                var updatedUser = await _paymentService.CreateWithdrawalAsync(userId, request.Amount);
                return Ok(new { newBalance = updatedUser.Balance });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, $"Nieudana próba wypłaty przez użytkownika {userId} - niewystarczające środki.");
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogError(ex, $"Nieudana próba wypłaty - nie znaleziono użytkownika {userId}.");
                return NotFound(new { message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, $"Błąd podczas przetwarzania wypłaty dla użytkownika {userId}.");
                return StatusCode(500, new { message = "Wystąpił wewnętrzny błąd serwera." });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetPaymentHistory()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            
            var history = await _paymentService.GetPaymentHistoryAsync(userId);
            return Ok(history);
        }

        
        [AllowAnonymous]
        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var stripeSignature = Request.Headers["Stripe-Signature"];

            
            if (string.IsNullOrEmpty(_webhookSecret))
            {
                _logger.LogError("Sekret Stripe Webhook (`Stripe:WebhookSecret`) nie jest ustawiony.");
                return StatusCode(500, "Webhook secret not configured.");
            }

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(json,
                    stripeSignature, _webhookSecret);
                
               if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Session;

                    
                    if (session == null)
                    {
                        _logger.LogError("Nie udało się sparsować obiektu Session z webhooka Stripe.");
                        return BadRequest("Invalid session object in webhook.");
                    }

                    _logger.LogInformation($"Otrzymano pomyślną płatność. Sesja: {session.Id}");

                    var userId = session.ClientReferenceId;
                    var amountTotal = session.AmountTotal;
                    if (!amountTotal.HasValue)
                    {
                         _logger.LogError($"Brak kwoty (AmountTotal) w sesji Stripe: {session.Id}");
                         return BadRequest();
                    }

                    var amountInPLN = (decimal)amountTotal.Value / 100;

                    if (string.IsNullOrEmpty(userId) || amountInPLN <= 0)
                    {
                        _logger.LogError($"Brak userId ({userId}) lub kwota ({amountInPLN}) jest niepoprawna dla sesji: {session.Id}");
                        return BadRequest();
                    }
                    
                    await _paymentService.CreateDepositAsync(userId, amountInPLN);
                    
                    _logger.LogInformation($"Pomyślnie zaktualizowano saldo dla użytkownika {userId}, kwota: {amountInPLN}");
                }
                else
                {
                    _logger.LogInformation($"Otrzymano inne zdarzenie Stripe: {stripeEvent.Type}");
                }

                return Ok();
            }
            catch (StripeException e)
            {
                _logger.LogError(e, "Błąd weryfikacji podpisu Stripe Webhook.");
                return BadRequest(new { error = "Invalid signature." });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Wewnętrzny błąd serwera podczas obsługi webhooka.");
                return StatusCode(500, new { error = "Internal server error." });
            }
        }
    }
}