namespace RcKlubbApp.Server.Media;

public sealed record MediaItem(
    Guid Id,
    string FileName,
    string Title,
    string AltText,
    long Size,
    DateTimeOffset UploadedAt);

public sealed record MediaLibrary(
    List<MediaItem> Images,
    Dictionary<string, Guid> Placements);

public sealed record UpdateMediaRequest(string Title, string AltText);
public sealed record AssignMediaRequest(Guid? ImageId);
