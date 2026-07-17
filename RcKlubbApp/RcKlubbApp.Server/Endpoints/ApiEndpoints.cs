using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RcKlubbApp.Server.Media;
using RcKlubbApp.Server.Membership;
using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RcKlubbApp.Server.Endpoints
{
    internal static class ApiEndpoints
    {
        public static void MapApiEndpoints(this WebApplication app)
        {
            var uploadsDirectory = Path.Combine(app.Environment.WebRootPath, "uploads");
            Directory.CreateDirectory(uploadsDirectory);

            var auth = app.MapGroup("/api/auth");
            auth.MapIdentityApi<IdentityUser>();
            auth.MapGet("/me", async (HttpContext context, UserManager<IdentityUser> users) =>
            {
                var user = await users.GetUserAsync(context.User);
                if (user is null) return Results.Unauthorized();
                return Results.Ok(new { user.Email, roles = await users.GetRolesAsync(user) });
            }).RequireAuthorization();

            app.MapGet("/api/media/placements/{placement}", async (string placement, MediaLibraryStore store, CancellationToken cancellationToken) =>
            {
                var library = await store.ReadAsync(cancellationToken);
                if (!library.Placements.TryGetValue(placement, out var imageId)) return Results.NotFound();
                var image = library.Images.FirstOrDefault(item => item.Id == imageId);
                return image is null ? Results.NotFound() : Results.Ok(new
                {
                    image.Id, image.Title, image.AltText,
                    url = $"/uploads/{Uri.EscapeDataString(image.FileName)}"
                });
            });

            app.MapPost("/api/membership-applications", async (CreateMembershipApplication request, MembershipApplicationStore store, CancellationToken cancellationToken) =>
            {
                var name = request.FullName?.Trim() ?? "";
                var email = request.Email?.Trim().ToLowerInvariant() ?? "";
                var phone = request.Phone?.Trim() ?? "";
                var streetAddress = request.StreetAddress?.Trim() ?? "";
                var postalCode = request.PostalCode?.Trim() ?? "";
                var city = request.City?.Trim() ?? "";
                if (!request.PrivacyAccepted) return Results.BadRequest(new { message = "Du må godta personvernerklæringen." });
                if (name.Length is < 2 or > 120) return Results.BadRequest(new { message = "Oppgi et gyldig navn." });
                if (email.Length > 200 || !new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(email))
                    return Results.BadRequest(new { message = "Oppgi en gyldig e-postadresse." });
                if (phone.Length is < 5 or > 30) return Results.BadRequest(new { message = "Oppgi et gyldig telefonnummer." });
                if (streetAddress.Length is < 3 or > 150) return Results.BadRequest(new { message = "Oppgi et gyldig gateadresse." });
                if (postalCode.Length != 4 || postalCode.Any(character => !char.IsDigit(character)))
                    return Results.BadRequest(new { message = "Postnummer må bestå av fire sifre." });
                if (city.Length is < 2 or > 100) return Results.BadRequest(new { message = "Oppgi et gyldig poststed." });
                if (request.BirthDate is not null &&
                    (request.BirthDate < new DateOnly(1920, 1, 1) || request.BirthDate > DateOnly.FromDateTime(DateTime.UtcNow)))
                    return Results.BadRequest(new { message = "Fødselsdatoen er ugyldig." });
                if ((request.Message?.Length ?? 0) > 1500) return Results.BadRequest(new { message = "Meldingen er for lang." });

                var application = await store.UpdateAsync(applications =>
                {
                    if (applications.Any(item => item.Email == email && item.Status == "Pending")) return null;
                    var item = new MembershipApplication(
                        Guid.NewGuid(), name, email, phone, request.BirthDate?.Year,
                        request.Experience?.Trim() ?? "Ikke oppgitt", request.Message?.Trim() ?? "",
                        "Pending", DateTimeOffset.UtcNow, null, null)
                    {
                        BirthDate = request.BirthDate,
                        StreetAddress = streetAddress,
                        PostalCode = postalCode,
                        City = city
                    };
                    applications.Add(item);
                    return item;
                }, cancellationToken);
                return application is null
                    ? Results.Conflict(new { message = "Det finnes allerede en søknad som venter for denne e-postadressen." })
                    : Results.Created($"/api/membership-applications/{application.Id}", new { application.Id, application.Status });
            });

            var membershipAdmin = app.MapGroup("/api/admin/membership-applications").RequireAuthorization("AdminOnly");
            membershipAdmin.MapGet("/", async (MembershipApplicationStore store, CancellationToken cancellationToken) =>
                Results.Ok((await store.ReadAsync(cancellationToken)).OrderByDescending(item => item.SubmittedAt)));
            membershipAdmin.MapPut("/{id:guid}", async (Guid id, ReviewMembershipApplication request, MembershipApplicationStore store, CancellationToken cancellationToken) =>
            {
                if (request.Status is not ("Approved" or "Rejected"))
                    return Results.BadRequest(new { message = "Ugyldig status." });
                var updated = await store.UpdateAsync(applications =>
                {
                    var index = applications.FindIndex(item => item.Id == id);
                    if (index < 0) return null;
                    var next = applications[index] with
                    {
                        Status = request.Status,
                        AdminComment = request.AdminComment?.Trim(),
                        ReviewedAt = DateTimeOffset.UtcNow
                    };
                    applications[index] = next;
                    return next;
                }, cancellationToken);
                return updated is null ? Results.NotFound() : Results.Ok(updated);
            });
            membershipAdmin.MapPut("/{id:guid}/payment", async (Guid id, RegisterMembershipPayment request, MembershipApplicationStore store, CancellationToken cancellationToken) =>
            {
                var year = DateTime.UtcNow.Year;
                var updated = await store.UpdateAsync(applications =>
                {
                    var index = applications.FindIndex(item => item.Id == id);
                    if (index < 0) return null;
                    var current = applications[index];
                    if (current.Status != "Approved") return null;
                    var next = current with
                    {
                        PaymentYear = request.Paid ? year : null,
                        PaidAt = request.Paid ? DateTimeOffset.UtcNow : null
                    };
                    applications[index] = next;
                    return next;
                }, cancellationToken);
                return updated is null ? Results.NotFound() : Results.Ok(updated);
            });

            var mediaAdmin = app.MapGroup("/api/admin/media").RequireAuthorization("AdminOnly");

            mediaAdmin.MapGet("/", async (MediaLibraryStore store, CancellationToken cancellationToken) =>
            {
                var library = await store.ReadAsync(cancellationToken);
                return Results.Ok(library.Images.OrderByDescending(image => image.UploadedAt).Select(image => new
                {
                    image.Id, image.FileName, image.Title, image.AltText, image.Size, image.UploadedAt,
                    url = $"/uploads/{Uri.EscapeDataString(image.FileName)}",
                    placements = library.Placements.Where(pair => pair.Value == image.Id).Select(pair => pair.Key)
                }));
            });

            mediaAdmin.MapPost("/", async (IFormFile image, MediaLibraryStore store, CancellationToken cancellationToken) =>
            {
                var validation = await ValidateImageAsync(image, cancellationToken);
                if (validation.Error is not null) return Results.BadRequest(new { message = validation.Error });
                var id = Guid.NewGuid();
                var fileName = $"{id:N}{validation.Extension}";
                await SaveImageAsync(image, Path.Combine(uploadsDirectory, fileName), cancellationToken);
                var item = new MediaItem(id, fileName, Path.GetFileNameWithoutExtension(image.FileName), "", image.Length, DateTimeOffset.UtcNow);
                await store.UpdateAsync(library => { library.Images.Add(item); return item; }, cancellationToken);
                return Results.Created($"/uploads/{fileName}", ToMediaResponse(item));
            }).DisableAntiforgery();

            mediaAdmin.MapPut("/{id:guid}", async (Guid id, UpdateMediaRequest request, MediaLibraryStore store, CancellationToken cancellationToken) =>
            {
                var updated = await store.UpdateAsync(library =>
                {
                    var index = library.Images.FindIndex(image => image.Id == id);
                    if (index < 0) return null;
                    var current = library.Images[index];
                    var next = current with { Title = request.Title.Trim(), AltText = request.AltText.Trim() };
                    library.Images[index] = next;
                    return next;
                }, cancellationToken);
                return updated is null ? Results.NotFound() : Results.Ok(ToMediaResponse(updated));
            });

            mediaAdmin.MapPut("/{id:guid}/file", async (Guid id, IFormFile image, MediaLibraryStore store, CancellationToken cancellationToken) =>
            {
                var validation = await ValidateImageAsync(image, cancellationToken);
                if (validation.Error is not null) return Results.BadRequest(new { message = validation.Error });
                var library = await store.ReadAsync(cancellationToken);
                var current = library.Images.FirstOrDefault(item => item.Id == id);
                if (current is null) return Results.NotFound();
                var nextFileName = $"{id:N}{validation.Extension}";
                await SaveImageAsync(image, Path.Combine(uploadsDirectory, nextFileName), cancellationToken);
                if (!string.Equals(current.FileName, nextFileName, StringComparison.OrdinalIgnoreCase))
                    File.Delete(Path.Combine(uploadsDirectory, current.FileName));
                var updated = await store.UpdateAsync(data =>
                {
                    var index = data.Images.FindIndex(item => item.Id == id);
                    var next = data.Images[index] with { FileName = nextFileName, Size = image.Length, UploadedAt = DateTimeOffset.UtcNow };
                    data.Images[index] = next;
                    return next;
                }, cancellationToken);
                return Results.Ok(ToMediaResponse(updated));
            }).DisableAntiforgery();

            mediaAdmin.MapPut("/placements/{placement}", async (string placement, AssignMediaRequest request, MediaLibraryStore store, CancellationToken cancellationToken) =>
            {
                var assigned = await store.UpdateAsync(library =>
                {
                    if (request.ImageId is null) { library.Placements.Remove(placement); return true; }
                    if (!library.Images.Any(image => image.Id == request.ImageId)) return false;
                    library.Placements[placement] = request.ImageId.Value;
                    return true;
                }, cancellationToken);
                return assigned ? Results.NoContent() : Results.NotFound();
            });

            mediaAdmin.MapDelete("/{id:guid}", async (Guid id, MediaLibraryStore store, CancellationToken cancellationToken) =>
            {
                var deleted = await store.UpdateAsync(library =>
                {
                    var image = library.Images.FirstOrDefault(item => item.Id == id);
                    if (image is null) return null;
                    library.Images.Remove(image);
                    foreach (var placement in library.Placements.Where(pair => pair.Value == id).Select(pair => pair.Key).ToList())
                        library.Placements.Remove(placement);
                    return image;
                }, cancellationToken);
                if (deleted is null) return Results.NotFound();
                File.Delete(Path.Combine(uploadsDirectory, deleted.FileName));
                return Results.NoContent();
            });
        }

        private static object ToMediaResponse(MediaItem image) => new
        {
            image.Id, image.FileName, image.Title, image.AltText, image.Size, image.UploadedAt,
            url = $"/uploads/{Uri.EscapeDataString(image.FileName)}",
            placements = Array.Empty<string>()
        };

        private static async Task<(string? Error, string Extension)> ValidateImageAsync(IFormFile image, CancellationToken cancellationToken)
        {
            const long maxFileSize = 8 * 1024 * 1024;
            if (image.Length is 0 or > maxFileSize) return ("Bildet må være mellom 1 byte og 8 MB.", "");
            var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
            if (extension is not (".jpg" or ".jpeg" or ".png" or ".webp")) return ("Kun JPG, PNG og WebP er tillatt.", "");
            await using var input = image.OpenReadStream();
            var signature = new byte[12];
            var read = await input.ReadAsync(signature, cancellationToken);
            var valid = extension switch
            {
                ".jpg" or ".jpeg" => read >= 3 && signature[0] == 0xFF && signature[1] == 0xD8 && signature[2] == 0xFF,
                ".png" => read >= 8 && signature[..8].SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }),
                ".webp" => read >= 12 && System.Text.Encoding.ASCII.GetString(signature, 0, 4) == "RIFF" && System.Text.Encoding.ASCII.GetString(signature, 8, 4) == "WEBP",
                _ => false
            };
            return valid ? (null, extension) : ("Filen ser ikke ut til å være et gyldig bilde.", "");
        }

        private static async Task SaveImageAsync(IFormFile image, string path, CancellationToken cancellationToken)
        {
            await using var input = image.OpenReadStream();
            await using var output = File.Create(path);
            await input.CopyToAsync(output, cancellationToken);
        }
    }
}
