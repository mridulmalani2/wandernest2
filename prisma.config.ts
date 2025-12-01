// prisma.config.ts (at project root)

import "dotenv/config"; // 👈 this loads .env into process.env
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Adjust this if your schema is somewhere else
  schema: path.join("src", "prisma", "schema.prisma"),
});
