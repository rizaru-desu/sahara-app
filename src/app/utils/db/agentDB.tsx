import { PrismaClient } from "@prisma/client";
import { Buffer } from "buffer";
import _ from "lodash";
import { number } from "zod";
const prisma = new PrismaClient();

interface AddAgentInput {
  facebook?: string;
  instagram?: string;
  ecommerce?: string;
  lamaUsaha: number;
  namaUsaha: string;
  merekUsaha: string;
  jumlahBooth: number;
}

export const addAgent = async ({
  facebook,
  instagram,
  ecommerce,
  lamaUsaha,
  namaUsaha,
  merekUsaha,
  jumlahBooth,
}: AddAgentInput) => {
  try {
    const result = await prisma.agent.create({
      data: {
        facebook,
        instagram,
        ecommerce,
        lamaUsaha,
        namaUsaha,
        merekUsaha,
        jumlahBooth,
      },
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

interface AddBoothInput {
  alamatBooth: string;
  photoBooth?: any;
  agentId: string;
  createBy: string;
  geolocation?: string;
}

export const addBooth = async ({
  alamatBooth,
  photoBooth,
  agentId,
  createBy,
  geolocation,
}: AddBoothInput) => {
  try {
    const result = await prisma.booth.create({
      data: {
        createBy,
        alamatBooth,
        photoBooth,
        agentId,
        geolocation,
      },
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const manyAgentPagination = async ({
  skip,
  take,
}: {
  skip: number;
  take: number;
}) => {
  try {
    const result = await prisma.agent.findMany({
      skip,
      take,
      orderBy: { namaUsaha: "asc" },
    });

    const totalCount = await prisma.agent.count();

    return { result, totalCount };
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const manyBoothPagination = async ({
  skip,
  take,
  agentId,
}: {
  skip: number;
  take: number;
  agentId: string;
}) => {
  try {
    const findAgent = await prisma.agent.findUnique({ where: { agentId } });
    const result = await prisma.booth.findMany({
      skip,
      take,
      where: { agentId },
      orderBy: { alamatBooth: "asc" },
    });

    const totalCount = _.size(result);

    return { result, totalCount, findAgent };
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const findPhoto = async ({ boothId }: { boothId: string }) => {
  try {
    const result = await prisma.booth.findUnique({
      where: { boothId },
      select: { photoBooth: true },
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const findManyAgentFilter = async ({ value }: { value: string }) => {
  try {
    const result = await prisma.agent.findMany({
      where: {
        OR: [
          {
            namaUsaha: { contains: value },
          },
          { merekUsaha: { contains: value } },
        ],
      },
      orderBy: { namaUsaha: "asc" },
    });

    return { result, totalCount: _.size(result) };
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const findManyBoothFilter = async ({ value }: { value: string }) => {
  try {
    const result = await prisma.booth.findMany({
      where: {
        OR: [
          {
            alamatBooth: { contains: value },
          },
        ],
      },
      orderBy: { alamatBooth: "asc" },
    });

    return { result, totalCount: _.size(result) };
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateTotalBooth = async ({
  value,
  agentId,
}: {
  value: number;
  agentId: string;
}) => {
  try {
    const result = await prisma.agent.update({
      where: {
        agentId,
      },
      data: {
        jumlahBooth: value,
      },
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};
