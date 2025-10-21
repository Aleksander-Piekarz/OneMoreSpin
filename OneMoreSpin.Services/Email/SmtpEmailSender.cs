using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;
using MimeKit;

namespace OneMoreSpin.Services.Email;

public class SmtpEmailSender : IEmailSender
{
    private readonly EmailSenderOptions _email;

    public SmtpEmailSender(IOptions<EmailSenderOptions> email)
    {
        _email = email.Value;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlMessage)
    {
        var msg = new MimeMessage();
        msg.From.Add(new MailboxAddress(_email.FromName, _email.FromAddress));
        msg.To.Add(MailboxAddress.Parse(to));
        msg.Subject = subject;
        msg.Body = new BodyBuilder { HtmlBody = htmlMessage }.ToMessageBody();

        var host = Environment.GetEnvironmentVariable("SMTP_HOST") ?? "smtp.gmail.com";
        var port = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
        var user = Environment.GetEnvironmentVariable("SMTP_USER");
        var pass = Environment.GetEnvironmentVariable("SMTP_PASS");
        var useStartTls = bool.Parse(Environment.GetEnvironmentVariable("SMTP_USESTARTTLS") ?? "true");

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, useStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto);
        await client.AuthenticateAsync(user, pass);
        await client.SendAsync(msg);
        await client.DisconnectAsync(true);
    }
}
