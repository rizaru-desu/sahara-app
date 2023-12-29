import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//region add string map
export const addStringMap = async ({ data }: { data: any }) => {
  try {
    const result = await prisma.stringMap.create({
      data,
    });

    return result;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  } finally {
    // Close the Prisma client to avoid leaks
    await prisma.$disconnect();
  }
};
//endregion
