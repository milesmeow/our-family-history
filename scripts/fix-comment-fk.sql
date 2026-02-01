-- Fix Comment table foreign key to point to User instead of User_old

-- 0. Clean up any leftover table from previous failed attempt
DROP TABLE IF EXISTS Comment_new;

-- 1. Create new Comment table with correct FK (matching exact schema from Turso)
CREATE TABLE Comment_new (
    `id` text PRIMARY KEY NOT NULL UNIQUE,
    `content` text NOT NULL,
    `createdAt` numeric DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updatedAt` numeric NOT NULL,
    `authorId` text,
    `entryId` text NOT NULL,
    FOREIGN KEY (`authorId`) REFERENCES "User"(`id`) ON UPDATE NO ACTION ON DELETE SET NULL,
    FOREIGN KEY (`entryId`) REFERENCES "Entry"(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);

-- 2. Copy all data from old Comment table, setting authorId to NULL for orphaned comments
INSERT INTO Comment_new
SELECT
    id, content, createdAt, updatedAt,
    CASE
        WHEN authorId IN (SELECT id FROM User) THEN authorId
        ELSE NULL
    END as authorId,
    entryId
FROM Comment;

-- 3. Drop old Comment table
DROP TABLE Comment;

-- 4. Rename new table to Comment
ALTER TABLE Comment_new RENAME TO Comment;
