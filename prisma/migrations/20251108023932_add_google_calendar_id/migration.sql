/*
  Warnings:

  - A unique constraint covering the columns `[googleCalendarId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN "googleCalendarId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_googleCalendarId_key" ON "Event"("googleCalendarId");
