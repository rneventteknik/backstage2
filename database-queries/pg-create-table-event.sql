CREATE TABLE public.Event
(
    "id" int PRIMARY KEY,
    "name" varchar,
    "created" timestamp without time zone,
    "updated" timestamp without time zone,
    "ownerUserId" integer REFERENCES public.User ("id"),
    "eventType" integer,
    "status" integer,
    "salaryStatus" integer,
    "invoiceHoogiaId" integer,
    "invoiceAddress" varchar,
    "invoiceTag" varchar,
    "invoiceNumber" varchar,
    "note" varchar,
    "returnalNote" varchar,
    "pricePlan" integer,
    "accountKind" integer,
    "location" varchar,
    "contactPersonName" varchar,
    "contactPersonPhone" varchar,
    "contactPersonEmail" varchar
);
