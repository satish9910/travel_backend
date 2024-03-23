import { PrismaClient } from '@prisma/client'

// const prisma = global.prisma || new PrismaClient();
//@ts-ignore
global.prisma = new PrismaClient()
