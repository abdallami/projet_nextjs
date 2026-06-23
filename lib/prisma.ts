// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/*import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}*/

// lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    }),
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
