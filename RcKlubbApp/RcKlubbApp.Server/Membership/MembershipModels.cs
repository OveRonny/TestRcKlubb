namespace RcKlubbApp.Server.Membership;

public sealed record MembershipApplication(
    Guid Id,
    string FullName,
    string Email,
    string Phone,
    int? BirthYear,
    string Experience,
    string Message,
    string Status,
    DateTimeOffset SubmittedAt,
    DateTimeOffset? ReviewedAt,
    string? AdminComment)
{
    public DateOnly? BirthDate { get; init; }
    public string StreetAddress { get; init; } = "";
    public string PostalCode { get; init; } = "";
    public string City { get; init; } = "";
    public int? PaymentYear { get; init; }
    public DateTimeOffset? PaidAt { get; init; }
}

public sealed record CreateMembershipApplication(
    string FullName,
    string Email,
    string Phone,
    DateOnly? BirthDate,
    string Experience,
    string Message,
    bool PrivacyAccepted)
{
    public string StreetAddress { get; init; } = "";
    public string PostalCode { get; init; } = "";
    public string City { get; init; } = "";
}

public sealed record ReviewMembershipApplication(string Status, string? AdminComment);
public sealed record RegisterMembershipPayment(bool Paid);
