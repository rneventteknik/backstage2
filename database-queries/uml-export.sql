CREATE TABLE "TimeEstimate"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "EventId" int,
    "NumberOfHours" int,
    "PricePerHour" int,
    PRIMARY KEY ("Id")
);

CREATE TABLE "EquipmentCategory"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    PRIMARY KEY ("Id")
);

CREATE TABLE "EventSalaryGroup"
(
    "EventId" int,
    "SalaryGroupId" int
);

CREATE TABLE "SalaryGroup"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "UserId" int,
    PRIMARY KEY ("Id")
);

CREATE TABLE "EquipmentPrice"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "EquipmentId" int,
    "PricePerUnit" int,
    "PricePerHour" int,
    "PricePerUnitTHS" int,
    "PricePerHourTHS" int,
    PRIMARY KEY ("Id")
);

CREATE TABLE "EquipmentBrokenPeriod"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "Equipment" int,
    "StartDatetime" datetime,
    "EndDatetime" datetime,
    PRIMARY KEY ("Id")
);

CREATE TABLE "User"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "Role" int,
    "MemberStatus" int,
    "NameTag" nvarchar,
    "PhoneNumber" nvarchar,
    "SlackId" nvarchar,
    PRIMARY KEY ("Id")
);

CREATE TABLE "EventChangelogEntry"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "EventId" int,
    PRIMARY KEY ("Id")
);

CREATE TABLE "EquipmentPackageEntry"
(
    "Id" int,
    "Created" datetime,
    "Updated" datetime,
    "EquipmentId" int,
    "EquipmentPackageId" int,
    "NumberOfUnits" int,
    PRIMARY KEY ("Id")
);

CREATE TABLE "*CustomerOrganisation*"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "InvoiceHoogiaCustomerNumber" int,
    "InvoiceAddress" nvarchar,
    "InvoiceTag" nvarchar,
    "PricePlan" int,
    "AccountKind" int,
    PRIMARY KEY ("Id")
);

CREATE TABLE "EquipmentList"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "EventId" int,
    "EquipmentOutDatetime" datetime,
    "EquipmentInDatetime" datetime,
    "UsageStartDatetime" datetime,
    "UsageEndDatetime" datetime,
    PRIMARY KEY ("Id")
);

CREATE TABLE "EquipmentCategoryEquipment"
(
    "EquipmentId" int,
    "EquipmentCategoryId" int
);

CREATE TABLE "Equipment"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "EquipmentPackageId" int,
    "InventoryCount" int,
    "NameEN" nvarchar,
    "Description" nvarchar,
    "DescriptionEN" nvarchar,
    "Note" nvarchar,
    "ImageId" int,
    "PubliclyHidden" bool,
    PRIMARY KEY ("Id")
);

CREATE TABLE "EquipmentPackage"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "Note" nvarchar,
    "ImageId" int,
    "EstimatedHours" int,
    PRIMARY KEY ("Id")
);

CREATE TABLE "*Subscriptions*"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    PRIMARY KEY ("Id")
);

CREATE TABLE "TimeReport"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "EventId" int,
    "UserId" int,
    "ActualWorkingHours" int,
    "BillableWorkingHours" int,
    "StartDatetime" datetime,
    "EndDatetime" datetime,
    "PricePerHour" int,
    "AccountKind" int,
    PRIMARY KEY ("Id")
);

CREATE TABLE "EventInvoiceGroup"
(
    "EventId" int,
    "InvoiceGroupId" int
);

CREATE TABLE "Image"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "ImageURL" nvarchar,
    PRIMARY KEY ("Id")
);

CREATE TABLE "EquipmentCategoryEquipmentPackage"
(
    "EquipmentPackageId" int,
    "EquipmentCategoryId" int
);

CREATE TABLE "Event"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "OwnerUserId" int,
    "EventType" int,
    "Status" int,
    "SalaryStatus" int,
    "InvoiceHoogiaId" int,
    "InvoiceAddress" nvarchar,
    "InvoiceTag" nvarchar,
    "InvoiceNumber" nvarchar,
    "Note" nvarchar,
    "ReturnalNote" nvarchar,
    "PricePlan" int,
    "AccountKind" int,
    "Location" nvarchar,
    "ContactPersonName" nvarchar,
    "ContactPersonPhone" nvarchar,
    "ContactPersonEmail" nvarchar,
    PRIMARY KEY ("Id")
);

CREATE TABLE "EquipmentListEntry"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "EquipmentListId" int,
    "EquipmentId" int,
    "NumberOfUnits" int,
    "NumberOfHours" int,
    "NameEN" nvarchar,
    "Description" nvarchar,
    "DescriptionEN" nvarchar,
    "PricePerUnit" int,
    "PricePerHour" int,
    "EquipmentPriceId" int,
    PRIMARY KEY ("Id")
);

CREATE TABLE "CoOwner"
(
    "EventId" int,
    "UserId" int
);

CREATE TABLE "EquipmentChangelogEntry"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "EquipmentId" int,
    PRIMARY KEY ("Id")
);

CREATE TABLE "InvoiceGroup"
(
    "Id" int,
    "Name" nvarchar,
    "Created" datetime,
    "Updated" datetime,
    "UserId" int,
    PRIMARY KEY ("Id")
);
