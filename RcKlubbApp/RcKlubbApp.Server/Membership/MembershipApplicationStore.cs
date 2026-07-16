using System.Text.Json;

namespace RcKlubbApp.Server.Membership;

public sealed class MembershipApplicationStore(IWebHostEnvironment environment)
{
    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly string _filePath = Path.Combine(environment.ContentRootPath, "App_Data", "membership-applications.json");
    private readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web) { WriteIndented = true };

    public async Task<List<MembershipApplication>> ReadAsync(CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);
        try { return await ReadUnsafeAsync(cancellationToken); }
        finally { _lock.Release(); }
    }

    public async Task<T> UpdateAsync<T>(Func<List<MembershipApplication>, T> update, CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            var applications = await ReadUnsafeAsync(cancellationToken);
            var result = update(applications);
            Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);
            await using var stream = File.Create(_filePath);
            await JsonSerializer.SerializeAsync(stream, applications, _options, cancellationToken);
            return result;
        }
        finally { _lock.Release(); }
    }

    private async Task<List<MembershipApplication>> ReadUnsafeAsync(CancellationToken cancellationToken)
    {
        if (!File.Exists(_filePath)) return [];
        await using var stream = File.OpenRead(_filePath);
        return await JsonSerializer.DeserializeAsync<List<MembershipApplication>>(stream, _options, cancellationToken) ?? [];
    }
}
