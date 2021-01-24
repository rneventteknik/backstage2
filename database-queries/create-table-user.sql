CREATE TABLE "dbo"."User"
(
    "Id" int PRIMARY KEY IDENTITY,
    "Name" nvarchar(max),
    "Created" datetime,
    "Updated" datetime,
    "Role" int,
    "MemberStatus" int,
    "NameTag" nvarchar(max),
    "PhoneNumber" nvarchar(max),
    "SlackId" nvarchar(max),
);
