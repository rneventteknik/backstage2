CREATE TABLE "Event"
(
    "Id" serial PRIMARY KEY,
    "Name" varchar,
    "Created" timestamp,
    "Updated" timestamp,
    "OwnerUserId" int REFERENCES "User"("Id"),
    "EventType" int,
    "Status" int,
    "SalaryStatus" int,
    "InvoiceHoogiaId" int,
    "InvoiceAddress" varchar,
    "InvoiceTag" varchar,
    "InvoiceNumber" varchar,
    "Note" varchar,
    "ReturnalNote" varchar,
    "PricePlan" int,
    "AccountKind" int,
    "Location" varchar,
    "ContactPersonName" varchar,
    "ContactPersonPhone" varchar,
    "ContactPersonEmail" varchar
);
