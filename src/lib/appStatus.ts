import { PrismaClient } from "@prisma/client";

export type AppStatus = {
  enabled: boolean;
  updatedAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient = global.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

// Do not rely on env for the application key; use the `keystart` table as source
const DEFAULT_KEY: string = '';

export async function getAppStatus(): Promise<AppStatus> {
  try {
    const rec = await prisma.keystart.findFirst({ orderBy: { id: "desc" } });
    if (!rec) {
      return { enabled: true, updatedAt: new Date().toISOString() };
    }
    return { enabled: !!rec.ativo, updatedAt: rec.atualizado_em ? rec.atualizado_em.toISOString() : new Date().toISOString() };
  } catch (error) {
    console.error("getAppStatus error:", error);
    return { enabled: true, updatedAt: new Date().toISOString() };
  }
}

export async function setAppStatus(enabled: boolean): Promise<AppStatus> {
  try {
    const rec = await prisma.keystart.findFirst({ orderBy: { id: "desc" } });
    let updated;
    if (rec) {
      updated = await prisma.keystart.update({ where: { id: rec.id }, data: { ativo: enabled, atualizado_em: new Date() } });
    } else {
      updated = await prisma.keystart.create({ data: { chave: '', ativo: enabled, atualizado_em: new Date() } });
    }
    return { enabled: !!updated.ativo, updatedAt: updated.atualizado_em ? updated.atualizado_em.toISOString() : new Date().toISOString() };
  } catch (error) {
    console.error("setAppStatus error:", error);
    return { enabled, updatedAt: new Date().toISOString() };
  }
}

export async function validateKey(key?: string): Promise<boolean> {
  try {
    const rec = await prisma.keystart.findFirst({ orderBy: { id: "desc" } });
    if (!rec) {
      return false;
    }
    return key === rec.chave;
  } catch (error) {
    console.error("validateKey error:", error);
    return false;
  }
}
