// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import "dotenv/config"
import { defineConfig} from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env("DATABASE_URL"),
    shadowDatabaseUrl: process.env["DIRECT_DATABASE_URL"],
  },
})