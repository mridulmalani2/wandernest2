-- CreateIndex
CREATE INDEX "RequestSelection_status_idx" ON "RequestSelection"("status");

-- CreateIndex
CREATE INDEX "RequestSelection_requestId_status_idx" ON "RequestSelection"("requestId", "status");

-- CreateIndex
CREATE INDEX "RequestSelection_studentId_status_idx" ON "RequestSelection"("studentId", "status");
