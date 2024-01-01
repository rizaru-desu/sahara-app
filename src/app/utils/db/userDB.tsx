import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//region find user by email
export const findByEmail = async ({ email }: { email: string }) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    return user;
  } catch (error: any) {
    // Instead of using "any" type, you can let TypeScript infer the type of the error
    throw new Error(error.message);
  } finally {
    // Close the Prisma client to avoid leaks
    await prisma.$disconnect();
  }
};
//endregion

export const findUser = async ({ userId }: { userId: string }) => {
  try {
    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        StringMap: true,
      },
    } as any);

    return user;
  } catch (error: any) {
    // Instead of using "any" type, you can let TypeScript infer the type of the error
    throw new Error(error.message);
  } finally {
    // Close the Prisma client to avoid leaks
    await prisma.$disconnect();
  }
};

//region create user
export const createUser = async ({
  dataUser,
}: {
  dataUser: {
    userId: string;
    email: string;
    password: string;
    phone: string;
    dateOfBirth: string;
    fullname: string;
    roleId: string;
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
    // Close the Prisma client to avoid leaks
    await prisma.$disconnect();
  }
};
//endregion
