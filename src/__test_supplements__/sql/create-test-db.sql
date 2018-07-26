CREATE TABLE public."Color" (
  id INTEGER NOT NULL,
  name VARCHAR(20),
  CONSTRAINT "Book_pkey" PRIMARY KEY(id)
);

CREATE TABLE public."Letter" (
  id INTEGER NOT NULL,
  name VARCHAR(20),
  CONSTRAINT "Letter_pkey" PRIMARY KEY(id)
);

CREATE TABLE public."ZEmpty" (
  id INTEGER NOT NULL,
  name VARCHAR(20),
  CONSTRAINT "Empty_pkey" PRIMARY KEY(id)
);

INSERT INTO "Color" VALUES (1, 'red'), (2, 'green');
INSERT INTO "Letter" VALUES (1, 'a'), (2, 'b');
