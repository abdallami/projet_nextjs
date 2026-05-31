/*import { PrismaClient } from '@prisma/client'
//import { PrismaPg } from '@prisma/adapter-pg'  // ✅ import manquant
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
     adapter : new PrismaBetterSqlite3({ url: "file:./dev.db"  })
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}*/
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ 
      url: `file:${path.join(process.cwd(), 'dev.db')}` // ✅ chemin absolu
    })
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}