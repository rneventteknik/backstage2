CREATE TABLE public.User
(
    "id" serial PRIMARY KEY,
    "name" varchar,
    "created" timestamp without time zone,
    "updated" timestamp without time zone,
    "role" integer,
    "memberStatus" integer,
    "nameTag" varchar,
    "phoneNumber" varchar,
    "slackId" varchar,
    "username" varchar,
    "hashedPassword" varchar,
    "salt" varchar
)
