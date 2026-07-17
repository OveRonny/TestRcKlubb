using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RcKlubbApp.Server.Data;
using RcKlubbApp.Server.Media;
using RcKlubbApp.Server.Membership;
using RcKlubbApp.Server.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Identity") ?? "Data Source=rcklubb-identity.db"));
builder.Services
    .AddIdentityApiEndpoints<IdentityUser>(options =>
    {
        options.Password.RequiredLength = 12;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireDigit = true;
        options.Password.RequireNonAlphanumeric = true;
        options.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
    options.MultipartBodyLengthLimit = 8 * 1024 * 1024);
builder.Services.AddSingleton<MediaLibraryStore>();
builder.Services.AddSingleton<MembershipApplicationStore>();

var app = builder.Build();

app.MapDefaultEndpoints();
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapStaticAssets();
if (app.Environment.IsDevelopment()) app.MapOpenApi();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

await RcKlubbApp.Server.Data.SeedData.SeedIdentityAsync(app.Services, app.Configuration);

app.MapApiEndpoints();

app.MapFallbackToFile("/index.html");
app.Run();
