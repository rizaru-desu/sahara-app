// prismaModule.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "process";

const prisma = new PrismaClient();

//** SECTION USER */
interface pageAllUsers {
  userId: string;
  skip: number;
  take: number;
}

const pageAllUser = async ({ userId, skip, take }: pageAllUsers) => {
  try {
    const [detail, roles, allUser, totalUser] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        include: { roles: { select: { stringId: true } } },
      }),
      prisma.stringMap.findMany({
        where: { objectName: "Roles" },
        select: { stringId: true, value: true },
      }),
      prisma.user.findMany({
        skip,
        take,
        select: {
          userId: true,
          fullname: true,
          phone: true,
          dateOfBirth: true,
          email: true,
          inActive: true,
          createdBy: true,
          modifiedBy: true,
          createdAt: true,
          modifedAt: true,
          leader: true,
          roles: {
            select: {
              roleId: true,
              stringId: true,
              value: true,
            },
          },
        },
        orderBy: { fullname: "asc" },
      }),
      prisma.user.count(),
    ]);

    return { detail, roles, allUser, totalUser };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface generateTokens {
  userId: string;
  userPassword: string;
  dbPassword: string;
}

const generateToken = async ({
  userId,
  userPassword,
  dbPassword,
}: generateTokens) => {
  try {
    return prisma.$transaction(async (tx) => {
      const password = await bcrypt.compare(userPassword, dbPassword);
      console.log(password, dbPassword, userPassword);
      if (password) {
        const token = jwt.sign({ userId: userId }, env?.JWT_SECRET || "", {
          expiresIn: "24hr",
        });

        const resultUser = await tx.authToken.create({
          data: {
            token,
            userId,
          },
        });

        return resultUser;
      } else {
        throw new Error(
          "Incorrect password. Please check your credentials and try again."
        );
      }
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface userPaginations {
  skip: number;
  take: number;
}

const userPagination = async ({ skip, take }: userPaginations) => {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take,
        select: {
          userId: true,
          fullname: true,
          phone: true,
          dateOfBirth: true,
          email: true,
          inActive: true,
          createdBy: true,
          modifiedBy: true,
          createdAt: true,
          modifedAt: true,
          leader: true,
          roles: {
            select: {
              roleId: true,
              stringId: true,
              value: true,
            },
          },
        },
        orderBy: { fullname: "asc" },
      }),
      prisma.user.count(),
    ]);

    return { result, count };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface valueSearch {
  value: string;
}

const userSearch = async ({ value }: valueSearch) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          OR: [
            {
              email: { contains: value },
            },
            { fullname: { contains: value } },
            { phone: { contains: value } },
          ],
        },
        select: {
          userId: true,
          fullname: true,
          phone: true,
          dateOfBirth: true,
          email: true,
          inActive: true,
          createdBy: true,
          modifiedBy: true,
          createdAt: true,
          modifedAt: true,
          leader: true,
          roles: {
            select: {
              roleId: true,
              stringId: true,
              value: true,
            },
          },
        },
        orderBy: { fullname: "asc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface detailUserInput {
  userId: string;
}

const detailUser = async ({ userId }: detailUserInput) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        include: { roles: { select: { stringId: true } } },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface AddUserInput {
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  fullname: string;
  leader?: string;
  createdBy?: string;
}

const addUser = async ({
  email,
  password,
  phone,
  dateOfBirth,
  fullname,
  leader,
  createdBy,
}: AddUserInput) => {
  try {
    return prisma.$transaction(async (tx) => {
      const findEmail = await tx.user.findUnique({
        where: { email: email },
      });

      if (!findEmail) {
        const resultUser = await tx.user.create({
          data: {
            email,
            password,
            phone,
            fullname,
            createdBy,
            dateOfBirth,
            leader,
          },
        });

        return resultUser;
      } else {
        throw new Error(
          "Please provide a different email address because your current one has already been registered."
        );
      }
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface addRoleUserInput {
  userId: string;
  stringId: string;
  createdBy: string;
}

const addRoleUser = async ({
  userId,
  stringId,
  createdBy,
}: addRoleUserInput) => {
  try {
    return prisma.$transaction(async (tx) => {
      const findRoleExist = await tx.roles.findFirst({
        where: {
          userId,
          stringId,
        },
      });

      if (findRoleExist) {
        throw new Error(`The role "${findRoleExist.value}" has been set.`);
      } else {
        const stringMap = await tx.stringMap.findUnique({
          where: { stringId },
        });

        if (stringMap) {
          const result = await tx.user.update({
            where: { userId },
            data: {
              roles: {
                create: {
                  createdBy,
                  stringId: stringMap?.stringId,
                  value: stringMap?.value,
                },
              },
            },
          });

          return result;
        }
        return null;
      }
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface deleteRoleUserInput {
  userId: string;
  roleId: any[];
}

const deleteRoleUser = async ({ userId, roleId }: deleteRoleUserInput) => {
  try {
    return prisma.$transaction(async (tx) => {
      const result = await tx.user.update({
        where: { userId },
        data: {
          roles: {
            deleteMany: roleId,
          },
        },
      });

      return result;
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface updateDataUserInput {
  userId: string;
  fullname: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  leader?: string;
  modifiedBy?: string;
}

const updateDataUser = async ({
  userId,
  fullname,
  dateOfBirth,
  email,
  leader,
  phone,
  modifiedBy,
}: updateDataUserInput) => {
  try {
    return prisma.$transaction(async (tx) => {
      const result = await tx.user.update({
        where: { userId },
        data: { modifiedBy, fullname, dateOfBirth, email, phone, leader },
      });

      return result;
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface activeUserInput {
  userId: string;
  value: boolean;
  modifiedBy: string;
}
const activeUser = async ({ userId, value, modifiedBy }: activeUserInput) => {
  try {
    return prisma.$transaction(async (tx) => {
      const result = await tx.user.update({
        where: { userId },
        data: { modifiedBy, inActive: value },
      });

      return result;
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const roles = async () => {
  try {
    return prisma.$transaction(async (tx) => {
      const result = await prisma.stringMap.findMany({
        where: { objectName: "Roles" },
        select: { stringId: true, value: true },
      });

      return result;
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const loginUser = async ({ email }: { email: string }) => {
  try {
    const [user, roles] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { email },
        include: { roles: { select: { stringId: true } } },
      }),
      prisma.stringMap.findMany({
        where: { objectName: "Roles" },
        select: { stringId: true, value: true },
      }),
    ]);

    return { user, roles };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

/** END  SECTION USER */

/** SECTION AGENT */
interface pageAllAgents {
  userId: string;
  skip: number;
  take: number;
}

const pageAllAgent = async ({ userId, skip, take }: pageAllAgents) => {
  try {
    const [detail, allAgent, totalAgent] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        include: { roles: { select: { stringId: true } } },
      }),
      prisma.agent.findMany({
        skip,
        take,

        orderBy: { customerName: "asc" },
      }),
      prisma.agent.count(),
    ]);

    return { detail, allAgent, totalAgent };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const agentSearch = async ({ value }: valueSearch) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.agent.findMany({
        where: {
          OR: [
            {
              email: { contains: value },
            },
            { customerName: { contains: value } },
            { picName: { contains: value } },
            { picPhone: { contains: value } },
            { alamatToko: { contains: value } },
          ],
        },

        orderBy: { customerName: "asc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface agentPaginations {
  skip: number;
  take: number;
}

const agentPagination = async ({ skip, take }: agentPaginations) => {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.agent.findMany({
        skip,
        take,

        orderBy: { customerName: "asc" },
      }),
      prisma.user.count(),
    ]);

    return { result, count };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface AgentInput {
  agentId?: string;
  email: string;
  customerName: string;
  picPhone: string;
  picName: string;
  alamatToko: string;
  noNpwp?: string;
  createdBy?: string;
  modifiedBy?: string;
}
const addAgent = async ({
  email,
  customerName,
  picName,
  picPhone,
  alamatToko,
  noNpwp,
  createdBy,
}: AgentInput) => {
  try {
    const result = await prisma.$transaction([
      prisma.agent.create({
        data: {
          email,
          customerName,
          picName,
          picPhone,
          alamatToko,
          noNpwp,
          createdBy,
        },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const editAgent = async ({
  agentId,
  email,
  customerName,
  picName,
  picPhone,
  alamatToko,
  noNpwp,
  modifiedBy,
}: AgentInput) => {
  try {
    const result = await prisma.$transaction([
      prisma.agent.update({
        where: { agentId },
        data: {
          email,
          customerName,
          picName,
          picPhone,
          alamatToko,
          noNpwp,
          modifiedBy,
        },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};
/** END SECTION AGENT */

/** SECTION PRODUCT */
interface pageAllProducts {
  userId: string;
  skip: number;
  take: number;
}

const pageAllProduct = async ({ userId, skip, take }: pageAllProducts) => {
  try {
    const [detail, allProduct, totalProduct] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        include: { roles: { select: { stringId: true } } },
      }),
      prisma.product.findMany({
        skip,
        take,

        orderBy: { productName: "asc" },
      }),
      prisma.product.count(),
    ]);

    return { detail, allProduct, totalProduct };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface productPaginations {
  skip: number;
  take: number;
}

const productPagination = async ({ skip, take }: productPaginations) => {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.product.findMany({
        skip,
        take,

        orderBy: { productName: "asc" },
      }),
      prisma.product.count(),
    ]);

    return { result, count };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface addProducts {
  productName: string;
  productCode: string;
  price: number;
  weight: number;
  unit: string;
  expiredPeriod: number;
  createdBy?: string;
}

const addProduct = async ({
  productName,
  productCode,
  price,
  weight,
  unit,
  expiredPeriod,
  createdBy,
}: addProducts) => {
  try {
    const result = await prisma.$transaction([
      prisma.product.create({
        data: {
          productName,
          productCode,
          price,
          weight,
          expiredPeriod,
          unit,
          createdBy,
        },
      }),
    ]);

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

interface batchAddProducts {
  dataProduct: [];
}

const batchAddProduct = async ({ dataProduct }: batchAddProducts) => {
  try {
    const result = await prisma.$transaction([
      prisma.product.createMany({
        data: dataProduct,
        skipDuplicates: true,
      }),
    ]);

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await prisma.$disconnect();
  }
};

const productSearch = async ({ value }: valueSearch) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.product.findMany({
        where: {
          OR: [
            {
              productName: { contains: value },
            },
            { productCode: { contains: value } },
          ],
        },

        orderBy: { productName: "asc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};
/** END SECTION PRODUCT */

/** SECTION LABEL */
/** END SECTION LABEL */

export {
  //** USER */
  generateToken,
  userPagination,
  loginUser,
  addUser,
  updateDataUser,
  activeUser,
  detailUser,
  addRoleUser,
  deleteRoleUser,
  roles,
  pageAllUser,
  userSearch,
  //** AGENT */
  pageAllAgent,
  agentSearch,
  agentPagination,
  addAgent,
  editAgent,
  //** PRODUCT */
  pageAllProduct,
  productSearch,
  addProduct,
  productPagination,
  batchAddProduct,
};