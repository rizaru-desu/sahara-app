import { PrismaClient } from "@prisma/client";
import _ from "lodash";
const prisma = new PrismaClient();

export const findByEmail = async ({ email }: { email: string }) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const findUser = async ({ userId }: { userId: string }) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        userId,
      },
      include: {
        StringMap: {
          select: {
            key: true,
            value: true,
          },
        },
      },
    } as any);

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const findManyUserFilter = async ({ value }: { value: string }) => {
  try {
    const result = await prisma.user.findMany({
      where: {
        OR: [
          {
            email: { contains: value },
          },
          { fullname: { contains: value } },
          { phone: { contains: value } },
        ],
        NOT: { userId: "f9442d7a-5715-4fbf-ba77-947208a8c03e" },
      },
      select: {
        userId: true,
        fullname: true,
        phone: true,
        dateOfBirth: true,
        email: true,
        roleId: true,
        verification: true,
        createBy: true,
        modifiedBy: true,
        createdAt: true,
        modifedAt: true,
      },
      orderBy: { fullname: "asc" },
    });

    return { result, totalCount: _.size(result) };
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const manyUserPagination = async ({
  skip,
  take,
}: {
  skip: number;
  take: number;
}) => {
  try {
    const user = await prisma.user.findMany({
      skip,
      take,
      select: {
        userId: true,
        fullname: true,
        phone: true,
        dateOfBirth: true,
        email: true,
        roleId: true,
        verification: true,
        createBy: true,
        modifiedBy: true,
        createdAt: true,
        modifedAt: true,
      },
      where: {
        NOT: { userId: "f9442d7a-5715-4fbf-ba77-947208a8c03e" },
      },
      orderBy: { fullname: "asc" },
    });
    const totalCount = await prisma.user.count();

    return { user, totalCount };
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateRoleUser = async ({
  userId,
  roleId,
  modifiedBy,
}: {
  userId: string;
  roleId: string;
  modifiedBy?: string;
}) => {
  try {
    const user = await prisma.user.update({
      where: { userId },
      data: { roleId, modifiedBy },
    });

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const createUser = async ({
  dataUser,
}: {
  dataUser: {
    email: string;
    password: string;
    phone: string;
    dateOfBirth: string;
    fullname: string;
    roleId: string;
    createBy?: string;
  };
}) => {
  try {
    const result = await prisma.user.create({
      data: dataUser,
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const batchCreateUser = async ({ dataUser }: { dataUser: [] }) => {
  try {
    const result = await prisma.user.createMany({
      data: dataUser,
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

export const deleteUser = async ({ userId }: { userId: string }) => {
  try {
    const result = await prisma.user.delete({
      where: {
        userId,
      },
    });
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};
