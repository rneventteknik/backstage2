-- Insert rows into table '"dbo"."User"'
INSERT INTO public.user
    ( -- columns to insert data into
    "name",
    "created",
    "updated",
    "role",
    "memberStatus",
    "nameTag",
    "phoneNumber",
    "slackId"
    )
VALUES
    ( -- first row: values for the columns in the list above
        N'Albert Jansson',
        '2019-01-01 15:30',
        '2019-01-01 15:30',
        0,
        0,
        N'AJ',
        N'08 517 397 22',
        NULL
    ),
    ( -- second row: values for the columns in the list above
        N'Markus Wesslén',
        '2019-01-02 15:30',
        '2019-01-02 15:30',
        1,
        3,
        N'MW',
        N'072 704 55 93',
        NULL
    );
-- add more rows here


-- Insert rows into table '"dbo"."Event"'
INSERT INTO public.event
    ( -- columns to insert data into
    "name",
    "created",
    "updated",
    "ownerUserId",
    "eventType",
    "status",
    "salaryStatus",
    "invoiceHoogiaId",
    "invoiceAddress",
    "invoiceTag",
    "invoiceNumber",
    "note",
    "returnalNote",
    "pricePlan",
    "accountKind",
    "location",
    "contactPersonName",
    "contactPersonPhone",
    "contactPersonEmail"
    )
VALUES
    ( -- first row: values for the columns in the list above
        N'Kemispexet',
        '2020-06-15 19:00',
        '2020-06-15 19:00',
        1,
        1,
        1,
        0,
        NULL,
        N'Kemivägen 3',
        NULL,
        N'2020-068',
        N'Tänk på att de vill ha väldigt många basar',
        NULL,
        1,
        1,
        N'Nya Matsalen',
        N'Kemist Kemistsson',
        N'070 000 00 00',
        N'kemist@kth.se'
    ),
    ( -- second row: values for the columns in the list above,
        N'METAspexet',
        '2020-05-22 18:00',
        '2020-05-22 18:00',
        2,
        0,
        4,
        0,
        NULL,
        N'Osquars backe 21',
        NULL,
        N'2020-067',
        N'Glöm inte extra kablar',
        N'En extra DMX-kabel retunerades',
        1,
        1,
        N'Hugoteatern',
        N'Anja och Christian',
        N'070 000 00 01',
        N'ljus@metaspexet.se'
    ),
    ( -- third row: values for the columns in the list above,
        N'Lunchföreläsning KTH Future Energy Conference 2020',
        '2020-06-22 12:00',
        '2020-07-22 13:00',
        2,
        1,
        1,
        0,
        1,
        N'Brinellvägen 8, Stockholm',
        N'KTH',
        N'2020-065',
        NULL,
        NULL,
        0,
        1,
        N'Nya Matsalen',
        N'Viggo',
        NULL,
        N'viggo@kth.com'
    )
