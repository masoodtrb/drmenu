/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `otp` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First add the column as nullable
ALTER TABLE "public"."otp" ADD COLUMN     "token" TEXT;

-- Update existing records with a default token (using a hash of id + timestamp)
UPDATE "public"."otp" SET "token" = encode(sha256(concat("id"::text, extract(epoch from "createdAt")::text)::bytea), 'hex') WHERE "token" IS NULL;

-- Make the column NOT NULL
ALTER TABLE "public"."otp" ALTER COLUMN "token" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "otp_token_key" ON "public"."otp"("token");

-- CreateIndex
CREATE INDEX "otp_token_idx" ON "public"."otp"("token");
