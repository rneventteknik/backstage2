CREATE TABLE "User"
(
    "Id" serial PRIMARY KEY,
    "Name" varchar,
    "Created" timestamp,
    "Updated" timestamp,
    "Role" int,
    "MemberStatus" int,
    "NameTag" varchar,
    "PhoneNumber" varchar,
    "SlackId" varchar
);
