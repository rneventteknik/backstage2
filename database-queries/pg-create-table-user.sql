CREATE TABLE public.User
(
    "id" int PRIMARY KEY,
    "name" varchar,
    "created" timestamp without time zone,
    "updated" timestamp without time zone,
    "role" integer,
    "memberStatus" integer,
    "nameTag" varchar,
    "phoneNumber" varchar,
    "slackId" varchar,
    "personalIdentityNumber" varchar,
    "bankName" varchar,
    "clearingNumber" varchar,
    "bankAccount" varchar,
    "homeAddress" varchar,
    "zipCode" varchar,
    "emailAddress" varchar
);

CREATE TABLE public.UserAuth
(
    "id" int PRIMARY KEY REFERENCES public.User,
    "username" varchar UNIQUE,
    "hashedPassword" varchar
);
