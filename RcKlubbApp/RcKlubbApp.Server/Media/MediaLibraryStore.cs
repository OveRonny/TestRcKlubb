using System.Text.Json;

namespace RcKlubbApp.Server.Media;

public sealed class MediaLibraryStore(IWebHostEnvironment environment)
{
    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly string _dataDirectory = Path.Combine(environment.ContentRootPath, "App_Data");
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web) { WriteIndented = true };

    private string LibraryPath => Path.Combine(_dataDirectory, "media-library.json");

    public async Task<MediaLibrary> ReadAsync(CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);
        try { return await ReadUnsafeAsync(cancellationToken); }
        finally { _lock.Release(); }
    }

    public async Task<T> UpdateAsync<T>(Func<MediaLibrary, T> update, CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            var library = await ReadUnsafeAsync(cancellationToken);
            var result = update(library);
            Directory.CreateDirectory(_dataDirectory);
            await using var stream = File.Create(LibraryPath);
            await JsonSerializer.SerializeAsync(stream, library, _jsonOptions, cancellationToken);
            return result;
        }
        finally { _lock.Release(); }
    }

    private async Task<MediaLibrary> ReadUnsafeAsync(CancellationToken cancellationToken)
    {
        if (!File.Exists(LibraryPath)) return new([], new(StringComparer.OrdinalIgnoreCase));
        await using var stream = File.OpenRead(LibraryPath);
        return await JsonSerializer.DeserializeAsync<MediaLibrary>(stream, _jsonOptions, cancellationToken)
            ?? new([], new(StringComparer.OrdinalIgnoreCase));
    }
}
