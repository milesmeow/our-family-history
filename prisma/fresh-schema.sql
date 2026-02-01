-- Fresh database schema for Family History App
-- Generated from prisma/schema.prisma
-- Use this to create a clean database from scratch
-- Run with: npx tsx scripts/apply-migration.ts (update to use this file)

-- ============================================
-- USER & AUTH MODELS
-- ============================================

CREATE TABLE "User" (
    `id` TEXT PRIMARY KEY NOT NULL UNIQUE,
    `email` TEXT NOT NULL UNIQUE,
    `emailVerified` NUMERIC,
    `name` TEXT,
    `nickname` TEXT,
    `avatarUrl` TEXT,
    `role` TEXT NOT NULL DEFAULT 'MEMBER',
    `createdAt` NUMERIC NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` NUMERIC NOT NULL,
    `passwordHash` TEXT,
    `requirePasswordChange` NUMERIC NOT NULL DEFAULT 0,
    `resetToken` TEXT UNIQUE,
    `resetTokenExpiry` NUMERIC,
    `personId` TEXT UNIQUE,
    FOREIGN KEY (`personId`) REFERENCES "Person"(`id`) ON UPDATE NO ACTION ON DELETE SET NULL
);

CREATE TABLE "Account" (
    `id` TEXT PRIMARY KEY NOT NULL UNIQUE,
    `userId` TEXT NOT NULL,
    `type` TEXT NOT NULL,
    `provider` TEXT NOT NULL,
    `providerAccountId` TEXT NOT NULL,
    `refresh_token` TEXT,
    `access_token` TEXT,
    `expires_at` INTEGER,
    `token_type` TEXT,
    `scope` TEXT,
    `id_token` TEXT,
    `session_state` TEXT,
    FOREIGN KEY (`userId`) REFERENCES "User"(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE UNIQUE INDEX `Account_provider_providerAccountId_key` ON `Account`(`provider`, `providerAccountId`);

CREATE TABLE "Session" (
    `id` TEXT PRIMARY KEY NOT NULL UNIQUE,
    `sessionToken` TEXT NOT NULL UNIQUE,
    `userId` TEXT NOT NULL,
    `expires` NUMERIC NOT NULL,
    FOREIGN KEY (`userId`) REFERENCES "User"(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE TABLE "VerificationToken" (
    `identifier` TEXT NOT NULL,
    `token` TEXT NOT NULL UNIQUE,
    `expires` NUMERIC NOT NULL
);

CREATE UNIQUE INDEX `VerificationToken_identifier_token_key` ON `VerificationToken`(`identifier`, `token`);

-- ============================================
-- CORE CONTENT MODELS
-- ============================================

CREATE TABLE "Person" (
    `id` TEXT PRIMARY KEY NOT NULL UNIQUE,
    `firstName` TEXT NOT NULL,
    `lastName` TEXT NOT NULL,
    `maidenName` TEXT,
    `nickname` TEXT,
    `birthDate` NUMERIC,
    `deathDate` NUMERIC,
    `relationship` TEXT,
    `bio` TEXT,
    `avatarUrl` TEXT,
    `createdAt` NUMERIC NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` NUMERIC NOT NULL
);

CREATE TABLE "Entry" (
    `id` TEXT PRIMARY KEY NOT NULL UNIQUE,
    `title` TEXT NOT NULL,
    `content` TEXT NOT NULL,
    `summary` TEXT,
    `eventDate` NUMERIC,
    `eventDateEnd` NUMERIC,
    `dateApproximate` NUMERIC NOT NULL DEFAULT 0,
    `datePrecision` TEXT NOT NULL DEFAULT 'DAY',
    `era` TEXT,
    `createdAt` NUMERIC NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` NUMERIC NOT NULL,
    `publishedAt` NUMERIC,
    `category` TEXT NOT NULL DEFAULT 'STORY',
    `location` TEXT,
    `locationLat` REAL,
    `locationLng` REAL,
    `authorId` TEXT,
    FOREIGN KEY (`authorId`) REFERENCES "User"(`id`) ON UPDATE NO ACTION ON DELETE SET NULL
);

CREATE TABLE "PersonOnEntry" (
    `id` TEXT PRIMARY KEY NOT NULL UNIQUE,
    `personId` TEXT NOT NULL,
    `entryId` TEXT NOT NULL,
    `role` TEXT,
    `createdAt` NUMERIC NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`personId`) REFERENCES "Person"(`id`) ON UPDATE NO ACTION ON DELETE CASCADE,
    FOREIGN KEY (`entryId`) REFERENCES "Entry"(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE UNIQUE INDEX `PersonOnEntry_personId_entryId_key` ON `PersonOnEntry`(`personId`, `entryId`);

-- ============================================
-- FAMILY TREE
-- ============================================

CREATE TABLE "FamilyRelation" (
    `id` TEXT PRIMARY KEY NOT NULL UNIQUE,
    `fromPersonId` TEXT NOT NULL,
    `toPersonId` TEXT NOT NULL,
    `relationType` TEXT NOT NULL,
    `createdAt` NUMERIC NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`fromPersonId`) REFERENCES "Person"(`id`) ON UPDATE NO ACTION ON DELETE CASCADE,
    FOREIGN KEY (`toPersonId`) REFERENCES "Person"(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE UNIQUE INDEX `FamilyRelation_fromPersonId_toPersonId_relationType_key` ON `FamilyRelation`(`fromPersonId`, `toPersonId`, `relationType`);

-- ============================================
-- MEDIA
-- ============================================

CREATE TABLE "Media" (
    `id` TEXT PRIMARY KEY NOT NULL UNIQUE,
    `url` TEXT NOT NULL,
    `type` TEXT NOT NULL DEFAULT 'IMAGE',
    `filename` TEXT,
    `caption` TEXT,
    `altText` TEXT,
    `dateTaken` NUMERIC,
    `createdAt` NUMERIC NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `entryId` TEXT NOT NULL,
    FOREIGN KEY (`entryId`) REFERENCES "Entry"(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE TABLE "PersonOnMedia" (
    `id` TEXT PRIMARY KEY NOT NULL UNIQUE,
    `personId` TEXT NOT NULL,
    `mediaId` TEXT NOT NULL,
    `createdAt` NUMERIC NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`personId`) REFERENCES "Person"(`id`) ON UPDATE NO ACTION ON DELETE CASCADE,
    FOREIGN KEY (`mediaId`) REFERENCES "Media"(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE UNIQUE INDEX `PersonOnMedia_personId_mediaId_key` ON `PersonOnMedia`(`personId`, `mediaId`);

-- ============================================
-- TAGS & COMMENTS
-- ============================================

CREATE TABLE "Tag" (
    `id` TEXT PRIMARY KEY NOT NULL UNIQUE,
    `name` TEXT NOT NULL UNIQUE,
    `createdAt` NUMERIC NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "TagOnEntry" (
    `id` TEXT PRIMARY KEY NOT NULL UNIQUE,
    `tagId` TEXT NOT NULL,
    `entryId` TEXT NOT NULL,
    `createdAt` NUMERIC NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`tagId`) REFERENCES "Tag"(`id`) ON UPDATE NO ACTION ON DELETE CASCADE,
    FOREIGN KEY (`entryId`) REFERENCES "Entry"(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE UNIQUE INDEX `TagOnEntry_tagId_entryId_key` ON `TagOnEntry`(`tagId`, `entryId`);

CREATE TABLE "Comment" (
    `id` TEXT PRIMARY KEY NOT NULL UNIQUE,
    `content` TEXT NOT NULL,
    `createdAt` NUMERIC NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` NUMERIC NOT NULL,
    `authorId` TEXT,
    `entryId` TEXT NOT NULL,
    FOREIGN KEY (`authorId`) REFERENCES "User"(`id`) ON UPDATE NO ACTION ON DELETE SET NULL,
    FOREIGN KEY (`entryId`) REFERENCES "Entry"(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);

-- ============================================
-- ENABLE FOREIGN KEYS (CRITICAL!)
-- ============================================

PRAGMA foreign_keys = ON;
