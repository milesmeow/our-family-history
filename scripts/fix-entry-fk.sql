-- Fix Entry table foreign key to point to User instead of User_old
-- This happened because User was rebuilt but Entry wasn't updated

-- 0. Clean up any leftover table from previous failed attempt
DROP TABLE IF EXISTS Entry_new;

-- 1. Create new Entry table with correct FK (matching exact schema from Turso)
CREATE TABLE Entry_new (
    `id` text PRIMARY KEY NOT NULL UNIQUE,
    `title` text NOT NULL,
    `content` text NOT NULL,
    `summary` text,
    `eventDate` numeric,
    `eventDateEnd` numeric,
    `dateApproximate` numeric DEFAULT false NOT NULL,
    `datePrecision` text DEFAULT 'DAY' NOT NULL,
    `era` text,
    `createdAt` numeric DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` numeric NOT NULL,
    `publishedAt` numeric,
    `category` text DEFAULT 'STORY' NOT NULL,
    `location` text,
    `locationLat` real,
    `locationLng` real,
    `authorId` text,
    FOREIGN KEY (`authorId`) REFERENCES "User"(`id`) ON UPDATE NO ACTION ON DELETE SET NULL
);

-- 2. Copy all data from old Entry table, setting authorId to NULL for orphaned entries
INSERT INTO Entry_new
SELECT
    id, title, content, summary, eventDate, eventDateEnd, dateApproximate,
    datePrecision, era, createdAt, updatedAt, publishedAt, category, location,
    locationLat, locationLng,
    CASE
        WHEN authorId IN (SELECT id FROM User) THEN authorId
        ELSE NULL
    END as authorId
FROM Entry;

-- 3. Drop old Entry table
DROP TABLE Entry;

-- 4. Rename new table to Entry
ALTER TABLE Entry_new RENAME TO Entry;
