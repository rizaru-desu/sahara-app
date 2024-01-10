import { PrismaClient } from "@prisma/client";
import { Buffer } from "buffer";
import _ from "lodash";
const prisma = new PrismaClient();

interface AddCustomerInput {
  facebook?: string;
  instagram?: string;
  ecommerce?: string;
  lamaUsaha: number;
  namaUsaha: string;
  merekUsaha: string;
  jumlahBooth: number;
}

export const addCustomer = async ({
  facebook,
  instagram,
  ecommerce,
  lamaUsaha,
  namaUsaha,
  merekUsaha,
  jumlahBooth,
}: AddCustomerInput) => {
  try {
    const result = await prisma.customer.create({
      data: {
        facebook: facebook,
        instagram: instagram,
        ecommerce: ecommerce,
        lamaUsaha: lamaUsaha,
        namaUsaha: namaUsaha,
        merekUsaha: merekUsaha,
        jumlahBooth: jumlahBooth,
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
  geolocation: string;
  photoBooth: string;
  userId: string;
  customerId: string;
}

export const addBooth = async ({
  alamatBooth,
  geolocation,
  photoBooth,
  userId,
  customerId,
}: AddBoothInput) => {
  try {
    const decodedPhotoBooth = Buffer.from(photoBooth, "base64");

    const result = await prisma.booth.create({
      data: {
        alamatBooth,
        geolocation,
        photoBooth: decodedPhotoBooth,
        userId,
        customerId,
      },
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const manyCustomerPagination = async ({
  skip,
  take,
}: {
  skip: number;
  take: number;
}) => {
  try {
    const result = await prisma.customer.findMany({
      skip,
      take,
      orderBy: { namaUsaha: "asc" },
    });

    const totalCount = await prisma.customer.count();

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
  customerId,
}: {
  skip: number;
  take: number;
  customerId: string;
}) => {
  try {
    const result = await prisma.booth.findMany({
      skip,
      take,
      where: { customerId },
      orderBy: { alamatBooth: "asc" },
    });

    const totalCount = await prisma.booth.count();

    return { result, totalCount };
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

export const findManyCustomerFilter = async ({ value }: { value: string }) => {
  try {
    const result = await prisma.customer.findMany({
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
