-- Set defaults for updatedAt columns to avoid NOT NULL insert failures
ALTER TABLE "Student" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Admin" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Tourist" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- Enforce referential integrity for assignedStudentId
ALTER TABLE "TouristRequest"
  ADD CONSTRAINT "TouristRequest_assignedStudentId_fkey"
  FOREIGN KEY ("assignedStudentId")
  REFERENCES "Student"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
