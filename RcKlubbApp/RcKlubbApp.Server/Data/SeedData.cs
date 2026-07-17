using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using RcKlubbApp.Server.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RcKlubbApp.Server.Data
{
    internal static class SeedData
    {
        public static async Task SeedIdentityAsync(IServiceProvider services, IConfiguration configuration)
        {
            await using var scope = services.CreateAsyncScope();
            var database = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await database.Database.EnsureCreatedAsync();

            var roles = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            foreach (var roleName in new[] { "Admin", "Member" })
                if (!await roles.RoleExistsAsync(roleName))
                    await roles.CreateAsync(new IdentityRole(roleName));

            var email = configuration["AdminSeed:Email"];
            var password = configuration["AdminSeed:Password"];
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password)) return;

            var users = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
            var admin = await users.FindByEmailAsync(email);
            if (admin is null)
            {
                admin = new IdentityUser { UserName = email, Email = email, EmailConfirmed = true };
                var result = await users.CreateAsync(admin, password);
                if (!result.Succeeded)
                    throw new InvalidOperationException(string.Join("; ", result.Errors.Select(error => error.Description)));
            }
            if (!await users.IsInRoleAsync(admin, "Admin")) await users.AddToRoleAsync(admin, "Admin");
        }
    }
}
