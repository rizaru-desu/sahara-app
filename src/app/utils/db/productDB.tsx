import { PrismaClient } from "@prisma/client";
import _ from "lodash";
const prisma = new PrismaClient();

interface batchProduct {
  dataProduct: [];
}

export const batchProduct = async ({ dataProduct }: batchProduct) => {
  try {
    const result = await prisma.product.createMany({
      data: dataProduct,
      skipDuplicates: true,
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

interface addProduct {
  productName: string;
  productCode: string;
  price: number;
  weight: number;
  unit: string;
  expiredPeriod: number;
  createBy?: string;
}

export const addProduct = async ({
  productName,
  productCode,
  price,
  weight,
  unit,
  expiredPeriod,
  createBy,
}: addProduct) => {
  try {
    const result = await prisma.product.create({
      data: {
        productName,
        productCode,
        price,
        weight,
        expiredPeriod,
        unit,
        createBy,
      },
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};