import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const addStringMap = async ({ data }: { data: any }) => {
  try {
    const result = await prisma.stringMap.create({
      data,
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const findStringMap = async ({ id }: { id: string }) => {
  try {
    const result = await prisma.stringMap.findUnique({
      where: { stringId: id },
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const findRoleStringMap = async () => {
  try {
    const result = await prisma.stringMap.findMany({
      where: { objectName: "Roles" },
      select: { stringId: true, objectName: true, key: true, value: true },
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};
