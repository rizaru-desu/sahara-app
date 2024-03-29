import { PrismaClient } from "@prisma/client";
import { env } from "process";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import _ from "lodash";
import moment from "moment";
import { nanoid } from "nanoid";

interface paginations {
  skip: number;
  take: number;
}

interface valueSearch {
  value: string;
}

interface pageAll {
  userId: string;
  skip: number;
  take: number;
}

//** SECTION USER */
const pageAllUser = async ({ userId, skip, take }: pageAll) => {
  try {
    const [detail, roles, allUser, totalUser] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
      }),
      prisma.stringMap.findMany({
        where: { objectName: "Roles" },
        select: { stringId: true, value: true },
      }),
      prisma.user.findMany({
        where: { NOT: { email: "developer@sahara.com" } },
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

const userPagination = async ({ skip, take }: paginations) => {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.user.findMany({
        where: { NOT: { email: "developer@sahara.com" } },
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
          NOT: { email: "developer@sahara.com" },
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
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
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
  roles?: any;
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
      const result = await tx.stringMap.findMany({
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
const pageAllAgent = async ({ userId, skip, take }: pageAll) => {
  try {
    const [detail, allAgent, totalAgent] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
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

const agentPagination = async ({ skip, take }: paginations) => {
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
  phoneAgent: string;
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
  phoneAgent,
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
          phone: phoneAgent,
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
  phoneAgent,
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
          phone: phoneAgent,
          modifiedBy,
        },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const agentExport = async () => {
  try {
    const [result] = await prisma.$transaction([
      prisma.agent.findMany({
        orderBy: { customerName: "asc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};
/** END SECTION AGENT */

/** SECTION PRODUCT */
const pageAllProduct = async ({ userId, skip, take }: pageAll) => {
  try {
    const [detail, allProduct, totalProduct] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
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

const productPagination = async ({ skip, take }: paginations) => {
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
  weight: number;
  basePoint: number;
  unit: string;
  expiredPeriod: number;
  createdBy?: string;
}

const addProduct = async ({
  productName,
  productCode,
  weight,
  basePoint,
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
          weight,
          expiredPeriod,
          unit,
          basePoint,
          createdBy,
        },
      }),
    ]);

    return result;
  } catch (error: any) {
    throw new Error(error.message);
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

const productExport = async () => {
  try {
    const [result] = await prisma.$transaction([
      prisma.product.findMany({
        orderBy: { productName: "asc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};
/** END SECTION PRODUCT */

/** SECTION BOOTH OWNER */

const pageAllOwnerBooth = async ({ userId, skip, take }: pageAll) => {
  try {
    const [detail, allBoothOwner, totalBoothOwner] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
      }),
      prisma.boothOwner.findMany({
        skip,
        take,

        orderBy: { fullname: "asc" },
      }),
      prisma.boothOwner.count(),
    ]);

    return { detail, allBoothOwner, totalBoothOwner };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface pageAllMemberBooths {
  userId?: string;
  skip: number;
  take: number;
  boothOwnerId: string;
}

const pageAllMemberBooth = async ({
  userId,
  skip,
  take,
  boothOwnerId,
}: pageAllMemberBooths) => {
  try {
    const [detail, allBoothMember, totalBoothMember] =
      await prisma.$transaction([
        prisma.user.findUnique({
          where: { userId },
          select: {
            userId: true,
            fullname: true,
            inActive: true,
            email: true,
            leader: true,
            roles: { select: { stringId: true } },
          },
        }),
        prisma.booth.findMany({
          skip,
          take,
          where: { boothOwnerId },
          orderBy: { fullname: "asc" },
        }),
        prisma.booth.count(),
      ]);

    return { detail, allBoothMember, totalBoothMember };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const boothOwnerPagination = async ({ skip, take }: paginations) => {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.boothOwner.findMany({
        skip,
        take,

        orderBy: { fullname: "asc" },
      }),
      prisma.boothOwner.count(),
    ]);

    return { result, count };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const boothMemberPagination = async ({
  skip,
  take,
  boothOwnerId,
}: pageAllMemberBooths) => {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.booth.findMany({
        skip,
        take,
        where: { boothOwnerId },
        orderBy: { fullname: "asc" },
      }),
      prisma.booth.count(),
    ]);

    return { result, count };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface boothMemberImages {
  boothId: string;
}

const boothMemberImage = async ({ boothId }: boothMemberImages) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.booth.findUnique({
        where: { boothId },
        select: { photoBooth: true },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const boothOwnerSearch = async ({ value }: valueSearch) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.boothOwner.findMany({
        where: {
          OR: [
            {
              fullname: { contains: value },
            },
            { alamatOwner: { contains: value } },
            { phone: { contains: value } },
            { email: { contains: value } },
          ],
        },

        orderBy: { fullname: "asc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const boothMemberSearch = async ({ value }: valueSearch) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.booth.findMany({
        where: {
          OR: [
            {
              fullname: { contains: value },
            },
            { alamatBooth: { contains: value } },
            { phone: { contains: value } },
            { email: { contains: value } },
          ],
        },

        orderBy: { fullname: "asc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const boothOwnerExport = async () => {
  try {
    const [result] = await prisma.$transaction([
      prisma.boothOwner.findMany({
        orderBy: { fullname: "asc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const boothMemberExport = async () => {
  try {
    const [result] = await prisma.$transaction([
      prisma.booth.findMany({
        orderBy: { fullname: "asc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

/** END BOOTH OWNER */

/** LABELING */
const pageAllLabeling = async ({ userId, skip, take }: pageAll) => {
  try {
    const [detail, allProduct, allLabel, totalLabel] =
      await prisma.$transaction([
        prisma.user.findUnique({
          where: { userId },
          select: {
            userId: true,
            fullname: true,
            inActive: true,
            email: true,
            leader: true,
            roles: { select: { stringId: true } },
          },
        }),
        prisma.product.findMany({
          orderBy: { productName: "asc" },
        }),
        prisma.labelProduct.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        prisma.labelProduct.count(),
      ]);

    return { detail, allProduct, allLabel, totalLabel };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface addLabelsProduct {
  data: any[];
}

const addLabelProduct = async ({ data }: addLabelsProduct) => {
  try {
    return prisma.$transaction(async (tx) => {
      const manyProduct = await tx.labelProduct.createMany({
        data: data,
        skipDuplicates: true,
      });

      if (manyProduct) {
        const duplicateCount = data.length - manyProduct.count;

        const productids = _.map(data, "productId");
        const labelCodeIds = _.map(data, "labelCode");

        const findProduct = await tx.product.findMany({
          where: { productId: { in: productids } },
        });

        const findLabelProduct = await tx.labelProduct.findMany({
          where: { labelCode: { in: labelCodeIds } },
        });

        if (findProduct && findLabelProduct) {
          const addStock = _.map(findLabelProduct, (dataItem: any) => {
            const matchedProduct = findProduct.find(
              (product) => product.productId === dataItem.productId
            );
            return matchedProduct
              ? _.assign(
                  {},
                  dataItem,
                  _.pick(matchedProduct, ["unit", "weight"])
                )
              : dataItem;
          });

          const finalResult = _.map(addStock, (item) => {
            return Object.assign(
              {
                labelProducts: item.labelCode,
                expiredDate: item.bestBefore,
              },
              _.omit(
                item,
                "bestBefore",
                "labelCode",
                "shift",
                "batch",
                "createdAt",
                "modifedAt",
                "modifiedBy",
                "printed",
                "labelBoxId"
              )
            );
          }) as any;

          const insertStock = await tx.stokPorudct.createMany({
            data: finalResult,
            skipDuplicates: true,
          });

          return { insertStock, manyProduct, duplicateCount };
        } else {
          throw new Error("Failed add label stock");
        }
      } else {
        throw new Error("Failed add label product");
      }
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const labelProductPagination = async ({ skip, take }: paginations) => {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.labelProduct.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.labelProduct.count(),
    ]);

    return { result, count };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const labelProductSearch = async ({ value }: valueSearch) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.labelProduct.findMany({
        where: {
          OR: [
            {
              productCode: { contains: value },
            },
            { labelCode: { contains: value } },
          ],
        },

        orderBy: { createdAt: "desc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface printabelsProduct {
  labelId: string[];
  modifiedBy?: string;
}

const labelProductPrinter = async ({
  labelId,
  modifiedBy,
}: printabelsProduct) => {
  try {
    const [result, labelExport] = await prisma.$transaction([
      prisma.labelProduct.updateMany({
        where: { labelId: { in: labelId } },
        data: { printed: 1, modifiedBy: modifiedBy },
      }),
      prisma.labelProduct.findMany({
        where: { labelId: { in: labelId } },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return { result, labelExport };
  } catch (e: any) {
    throw new Error(e.message);
  }
};
/** END LABELING */

/** SECTION LABELING BOX */
const pageAllLabelingBox = async ({ userId, skip, take }: pageAll) => {
  try {
    const [
      detail,
      allLabelBox,
      totalLabelBox,
      allLabel,
      totalLabel,
      statusMap,
    ] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
      }),
      prisma.labelBox.findMany({
        skip,
        take,
        include: { labelProduct: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.labelBox.count(),
      prisma.labelProduct.findMany({
        where: { AND: [{ labelBoxId: null }] },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.labelProduct.count({
        where: { AND: [{ labelBoxId: null }] },
      }),
      prisma.stringMap.findMany({ where: { objectName: "Labeling Box" } }),
    ]);

    return {
      detail,
      allLabelBox,
      totalLabelBox,
      allLabel,
      totalLabel,
      statusMap,
    };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const pageAllLabelingBoxChild = async ({
  userId,
  labelBoxId,
  skip,
  take,
}: {
  userId: string;
  labelBoxId: string;
  skip: number;
  take: number;
}) => {
  try {
    const [detail, allLabelBox, allLabelProduct, totalLabelProduct] =
      await prisma.$transaction([
        prisma.user.findUnique({
          where: { userId },
          select: {
            userId: true,
            fullname: true,
            inActive: true,
            email: true,
            leader: true,
            roles: { select: { stringId: true } },
          },
        }),
        prisma.labelBox.findUnique({
          where: { labelBoxId },
          include: { labelProduct: { orderBy: { createdAt: "desc" } } },
        }),
        prisma.labelProduct.findMany({
          where: { AND: [{ labelBoxId: null }] },
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        prisma.labelProduct.count({
          where: { AND: [{ labelBoxId: null }] },
        }),
      ]);

    return { detail, allLabelBox, allLabelProduct, totalLabelProduct };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const labelBoxPagination = async ({ skip, take }: paginations) => {
  try {
    const [result, count, statusMap] = await prisma.$transaction([
      prisma.labelBox.findMany({
        skip,
        take,
        include: { labelProduct: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.labelBox.count(),
      prisma.stringMap.findMany({ where: { objectName: "Labeling Box" } }),
    ]);

    return { result, count, statusMap };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const labelBoxFind = async ({ labelBoxId }: { labelBoxId: string }) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.labelBox.findUnique({
        where: { labelBoxId },
        include: { labelProduct: { orderBy: { createdAt: "desc" } } },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const labelBoxSearch = async ({ value }: valueSearch) => {
  try {
    const [result, statusMap] = await prisma.$transaction([
      prisma.labelBox.findMany({
        where: {
          OR: [
            {
              labelCodeBox: { contains: value },
            },
          ],
        },
        include: { labelProduct: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.stringMap.findMany({ where: { objectName: "Labeling Box" } }),
    ]);

    return { statusMap, result };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const labelBoxProductPagination = async ({ skip, take }: paginations) => {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.labelProduct.findMany({
        where: { AND: [{ labelBoxId: null }] },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.labelProduct.count(),
    ]);

    return { result, count };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const labelBoxProductSearch = async ({ value }: valueSearch) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.labelProduct.findMany({
        where: {
          OR: [
            { productCode: { contains: value } },
            { labelCode: { contains: value } },
            { NOT: { AND: [{ labelBoxId: undefined }] } },
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

interface addLabelsBox {
  labelId: string[];
  labelCodeBox: string;
  leader: string;
  createdBy?: string;
}

const addLabelBox = async ({
  labelId,
  labelCodeBox,
  leader,
  createdBy,
}: addLabelsBox) => {
  try {
    return prisma.$transaction(async (tx) => {
      const insertLabelBox = await tx.labelBox.create({
        data: { labelCodeBox, createdBy, leader },
      });

      if (insertLabelBox) {
        const updateProduct = await tx.labelProduct.updateMany({
          where: { labelId: { in: labelId } },
          data: {
            labelBoxId: insertLabelBox.labelBoxId,
            modifiedBy: createdBy,
          },
        });

        const updateStock = await tx.stokPorudct.updateMany({
          where: { labelId: { in: labelId } },
          data: {
            labelBoxId: insertLabelBox.labelBoxId,
            labelBoxs: insertLabelBox.labelCodeBox,
            status: 1,
            modifiedBy: createdBy,
          },
        });

        return { insertLabelBox, updateProduct, updateStock };
      } else {
        throw new Error("Failed add label box");
      }
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

interface addLabelsToBox {
  labelId: string[];
  labelBoxId: string;
  createdBy?: string;
}

const addLabelToBox = async ({
  labelId,
  labelBoxId,
  createdBy,
}: addLabelsToBox) => {
  try {
    return prisma.$transaction(async (tx) => {
      const updateProduct = await tx.labelProduct.updateMany({
        where: { labelId: { in: labelId } },
        data: {
          labelBoxId,
          modifiedBy: createdBy,
        },
      });

      return updateProduct;
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const removeProductBox = async ({
  labelId,
  createdBy,
}: {
  labelId: string[];
  createdBy?: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const removeProduct = await tx.labelProduct.updateMany({
        where: { labelId: { in: labelId } },
        data: {
          labelBoxId: null,
          modifiedBy: createdBy,
        },
      });

      return { removeProduct };
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const labelBoxPrinter = async ({ labelId, modifiedBy }: printabelsProduct) => {
  try {
    const [result, labelExport] = await prisma.$transaction([
      prisma.labelBox.updateMany({
        where: { labelBoxId: { in: labelId } },
        data: { statusBox: 1, modifiedBy: modifiedBy },
      }),
      prisma.labelBox.findMany({
        where: { labelBoxId: { in: labelId } },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return { result, labelExport };
  } catch (e: any) {
    throw new Error(e.message);
  }
};
/** END SECTION LABELING BOX*/

/** SECTION STOCK PRODUCT */
const pageAllStockProduct = async ({ userId, skip, take }: pageAll) => {
  try {
    const [detail, allStock, totalStock, statusMap] = await prisma.$transaction(
      [
        prisma.user.findUnique({
          where: { userId },
          select: {
            userId: true,
            fullname: true,
            inActive: true,
            email: true,
            leader: true,
            roles: { select: { stringId: true } },
          },
        }),
        prisma.stokPorudct.findMany({
          skip,
          take,
          orderBy: { status: "desc" },
        }),
        prisma.stokPorudct.count(),
        prisma.stringMap.findMany({
          where: { objectName: "Stock Product" },
          orderBy: { key: "asc" },
        }),
      ]
    );

    return { detail, allStock, totalStock, statusMap };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const stockProdutPagination = async ({ skip, take }: paginations) => {
  try {
    const [result, count, statusMap] = await prisma.$transaction([
      prisma.stokPorudct.findMany({
        skip,
        take,
        orderBy: { status: "desc" },
      }),
      prisma.stokPorudct.count(),
      prisma.stringMap.findMany({
        where: { objectName: "Stock Product" },
        orderBy: { key: "asc" },
      }),
    ]);

    return { result, count, statusMap };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const stockProdutSearch = async ({ value }: valueSearch) => {
  try {
    const [result, statusMap] = await prisma.$transaction([
      prisma.stokPorudct.findMany({
        where: {
          OR: [
            { productCode: { contains: value } },
            { productName: { contains: value } },
            { labelBoxs: { contains: value } },
            { labelProducts: { contains: value } },
          ],
        },
        orderBy: { status: "desc" },
      }),
      prisma.stringMap.findMany({
        where: { objectName: "Stock Product" },
        orderBy: { key: "asc" },
      }),
    ]);

    return { result, statusMap };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const stockBox = async () => {
  try {
    const [result] = await prisma.$transaction([
      prisma.stokPorudct.findMany({
        where: {
          labelBoxs: {
            // Search for labelBoxs not null
            not: null,
          },
          location: null, // Search for location being null
        },
        distinct: ["labelBoxs"],
        orderBy: { status: "desc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const addStockLocation = async ({
  location,
  labelBoxId,
  createdBy,
}: {
  location: string;
  labelBoxId: string;
  createdBy?: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const findBox = await tx.stokPorudct.findMany({
        where: {
          labelBoxId,
        },
      });

      if (findBox) {
        const stockIds = findBox.map((stock) => stock.stockId);
        const findPoint = await tx.stokPorudct.updateMany({
          where: { stockId: { in: stockIds } },
          data: { location, status: 2, modifiedBy: createdBy },
        });

        return findPoint;
      }
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const stockProdutRangeSearch = async ({
  rangeDate,
}: {
  rangeDate: { startDate: string; endDate: string };
}) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.stokPorudct.findMany({
        where: {
          OR: [
            { createdAt: { gte: rangeDate.startDate, lte: rangeDate.endDate } },
            {
              modifedAt: { gte: rangeDate.startDate, lte: rangeDate.endDate },
            },
          ],
        },
        orderBy: { status: "desc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};
/** END SECTION STOCK PRODUCT */

/** END SECTION LOYALTY */
const pageAllLoyalty = async ({ userId, skip, take }: pageAll) => {
  try {
    const [detail, allLoyalty, totalLoyalty] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
      }),
      prisma.loyaltyPoint.findMany({
        skip,
        take,
        include: {
          userIdData: { select: { fullname: true, email: true, phone: true } },
        },
        orderBy: { modifedAt: "desc" },
      }),
      prisma.loyaltyPoint.count(),
    ]);

    return { detail, allLoyalty, totalLoyalty };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const pageAllLoyaltyLog = async ({ userId, skip, take }: pageAll) => {
  try {
    const [detail, allLoyaltyLog, totalLoyaltyLog] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
      }),
      prisma.loyaltyPointLog.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.loyaltyPointLog.count(),
    ]);

    return { detail, allLoyaltyLog, totalLoyaltyLog };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const loyaltyPagination = async ({ skip, take }: paginations) => {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.loyaltyPoint.findMany({
        skip,
        take,
        include: {
          userIdData: { select: { fullname: true, email: true, phone: true } },
        },
        orderBy: { modifedAt: "desc" },
      }),
      prisma.loyaltyPoint.count(),
    ]);

    return { result, count };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const loyaltyLogPagination = async ({ skip, take }: paginations) => {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.loyaltyPointLog.findMany({
        skip,
        take,

        orderBy: { createdAt: "desc" },
      }),
      prisma.loyaltyPointLog.count(),
    ]);

    return { result, count };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const loyaltyLogSearch = async ({ value }: valueSearch) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.loyaltyPointLog.findMany({
        where: {
          OR: [
            { productCode: { contains: value } },
            { productName: { contains: value } },
            { labelProducts: { contains: value } },
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const loyaltySearch = async ({ value }: valueSearch) => {
  try {
    return prisma.$transaction(async (tx) => {
      const insertLabelBox = await tx.user.findMany({
        where: {
          OR: [
            {
              email: { contains: value },
            },
            { fullname: { contains: value } },
            { phone: { contains: value } },
          ],
        },
      });

      if (insertLabelBox) {
        const userIds = insertLabelBox.map((user) => user.userId);
        const findPoint = await tx.loyaltyPoint.findMany({
          where: { userId: { in: userIds } },
          include: {
            userIdData: {
              select: { fullname: true, email: true, phone: true },
            },
          },
          orderBy: { modifedAt: "desc" },
        });

        return findPoint;
      }
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const loyaltyPenaltyPoint = async ({
  pointId,
  userId,
  point,
  loyaltyPoint,
  remark,
  createdBy,
}: {
  pointId: string;
  userId: string;
  point: number;
  loyaltyPoint: string;
  remark: string;
  createdBy?: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const findPointId = await tx.loyaltyPoint.findUnique({
        where: { pointId },
      });

      if (findPointId) {
        let result = _.subtract(findPointId.loyaltyPoint, point);
        const penalty = await tx.loyaltyPoint.update({
          where: { pointId },
          data: {
            loyaltyPoint: _.max([result, 0]),
            modifiedBy: createdBy,
            log: {
              create: { userId, loyaltyPoint, remark, createdBy },
            },
          },
          include: {
            userIdData: {
              select: { fullname: true, email: true, phone: true },
            },
          },
        });

        return { penalty };
      } else {
        throw new Error("User point not found.");
      }
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};
/** END SECTION LOYALTY */

/** END SECTION POINT & CAMPAING */
const pageAllPoCam = async ({ userId, skip, take }: pageAll) => {
  try {
    const [detail, allCampaign, totalCampaign, allProduct] =
      await prisma.$transaction([
        prisma.user.findUnique({
          where: { userId },
          select: {
            userId: true,
            fullname: true,
            inActive: true,
            email: true,
            leader: true,
            roles: { select: { stringId: true } },
          },
        }),
        prisma.campaign.findMany({
          skip,
          take,
          include: { product: true },
          orderBy: { campaignName: "desc" },
        }),
        prisma.campaign.count(),
        prisma.product.findMany({ where: { campaignId: null } }),
      ]);

    return { detail, allCampaign, totalCampaign, allProduct };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const addCampaign = async ({
  campaignName,
  startDate,
  endDate,
  productId,
  loyaltyPoint,
  photo,
  description,
  createdBy,
}: {
  campaignName: string;
  startDate: Date;
  endDate: Date;
  productId: string[];
  loyaltyPoint: number;
  photo: any;
  description: string;
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const insertCampaign = await tx.campaign.create({
        data: {
          campaignName,
          startDate,
          endDate,
          loyaltyPoint,
          photo,
          description,
          createdBy,
        },
      });

      if (insertCampaign) {
        const updateProduct = await tx.product.updateMany({
          where: { productId: { in: productId } },
          data: {
            campaignId: insertCampaign.campaignId,
            modifiedBy: createdBy,
          },
        });

        return { updateProduct };
      }
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const editCampaign = async ({
  campaignId,
  campaignName,
  startDate,
  endDate,
  removeProductId,
  productId,
  loyaltyPoint,
  photo,
  description,
  createdBy,
}: {
  campaignId: string;
  campaignName: string;
  startDate: Date;
  endDate: Date;
  removeProductId?: string[];
  productId: string[];
  loyaltyPoint: number;
  photo?: any;
  description: string;
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const insertCampaign = await tx.campaign.update({
        where: { campaignId },
        data: {
          campaignName,
          startDate,
          endDate,
          loyaltyPoint,
          photo,
          description,
          modifiedBy: createdBy,
        },
      });

      if (insertCampaign) {
        const updateProduct = await tx.product.updateMany({
          where: { productId: { in: productId } },
          data: {
            campaignId: insertCampaign.campaignId,
            modifiedBy: createdBy,
          },
        });

        if (removeProductId) {
          const removeProduct = await tx.product.updateMany({
            where: { productId: { in: removeProductId } },
            data: {
              campaignId: null,
              modifiedBy: createdBy,
            },
          });

          return { removeProduct };
        }

        return { updateProduct };
      }
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const campaignPagination = async ({ skip, take }: paginations) => {
  try {
    const [result, count, allProduct] = await prisma.$transaction([
      prisma.campaign.findMany({
        skip,
        take,
        include: { product: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.campaign.count(),
      prisma.product.findMany({ where: { campaignId: null } }),
    ]);

    return { result, count, allProduct };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const campaignSearch = async ({ value }: valueSearch) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.campaign.findMany({
        where: {
          OR: [{ campaignName: { contains: value } }],
        },
        include: { product: true },
        orderBy: { startDate: "desc" },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const inActiveCampaign = async ({
  campaignId,
  value,
  createdBy,
}: {
  campaignId: string;
  value: boolean;
  createdBy: string;
}) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.campaign.update({
        where: {
          campaignId,
        },
        data: { inActive: value, modifiedBy: createdBy },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const campaignImage = async ({ campaignId }: { campaignId: string }) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.campaign.findUnique({
        where: { campaignId },
        select: { photo: true },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};
/** END SECTION POINT & CAMPAING */

/** SECTION DASHBOARD */
const pageDashboard = async ({ userId }: { userId: string }) => {
  try {
    const [detail, topTenPoint, activeCampaign] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
      }),
      prisma.loyaltyPoint.findMany({
        orderBy: { loyaltyPoint: "desc" },
        take: 10,
        include: { userIdData: { select: { fullname: true } } },
      }),
      prisma.campaign.findMany({
        where: { inActive: false },
        take: 10,
        orderBy: { startDate: "desc" },
      }),
    ]);

    return { detail, topTenPoint, activeCampaign };
  } catch (e: any) {
    throw new Error(e.message);
  }
};
/** END SECTION DASHBOARD*/

/** SECTION DELIVERY ORDER */
const pageAllDeliveryOrder = async ({ userId, skip, take }: pageAll) => {
  try {
    const [detail, allSurat, totalSurat, statusMap] = await prisma.$transaction(
      [
        prisma.user.findUnique({
          where: { userId },
          select: {
            userId: true,
            fullname: true,
            inActive: true,
            email: true,
            leader: true,
            roles: { select: { stringId: true } },
          },
        }),
        prisma.suratJalan.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        prisma.suratJalan.count(),
        prisma.stringMap.findMany({
          where: { objectName: "Delivery Request" },
          orderBy: { key: "asc" },
        }),
      ]
    );

    return { detail, allSurat, totalSurat, statusMap };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const pageAllDeliveryOrderProduct = async ({
  userId,
  skip,
  take,
  suratJalanId,
}: {
  userId: string;
  skip: number;
  take: number;
  suratJalanId: string;
}) => {
  try {
    const [detail, allSurat, totalSurat] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
      }),
      prisma.suratJalanProduct.findMany({
        where: { suratJalanId },
        skip,
        take,
        include: { box: { include: { labelProduct: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.suratJalanProduct.count(),
    ]);

    return { detail, allSurat, totalSurat };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const deliveryOrderPagination = async ({ skip, take }: paginations) => {
  try {
    const [result, count, statusMap] = await prisma.$transaction([
      prisma.suratJalan.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.suratJalan.count(),
      prisma.stringMap.findMany({
        where: { objectName: "Delivery Request" },
        orderBy: { key: "asc" },
      }),
    ]);

    return { result, count, statusMap };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const deliveryOrderProductPagination = async ({
  skip,
  take,
  suratJalanId,
}: {
  skip: number;
  take: number;
  suratJalanId: string;
}) => {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.suratJalanProduct.findMany({
        skip,
        take,
        where: { suratJalanId },
        include: {
          box: {
            include: {
              labelProduct: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.suratJalanProduct.count(),
    ]);

    return { result, count };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const deliveryOrderSearch = async ({ value }: valueSearch) => {
  try {
    const [result, statusMap] = await prisma.$transaction([
      prisma.suratJalan.findMany({
        where: {
          OR: [{ noSurat: { contains: value } }],
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.stringMap.findMany({
        where: { objectName: "Delivery Request" },
        orderBy: { key: "asc" },
      }),
    ]);

    return { result, statusMap };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const deliveryOrderFind = async ({
  suratJalanId,
  createdBy,
}: {
  suratJalanId: string;
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const insertSuratJalan = await tx.suratJalan.update({
        where: { suratJalanId },
        data: { status: 2, modifiedBy: createdBy },
      });

      if (insertSuratJalan) {
        const findSuratJalan = await tx.suratJalan.findUnique({
          where: { suratJalanId: insertSuratJalan.suratJalanId },
          include: { suratJalanProduct: true },
        });

        if (findSuratJalan) {
          const productIds = _.map(
            findSuratJalan.suratJalanProduct,
            "labelBoxId"
          );

          const findProductInStock = await tx.stokPorudct.findMany({
            where: { labelBoxId: { in: productIds } },
          });

          return { findProductInStock, findSuratJalan };
        }
      }

      return { insertSuratJalan };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const getRecaiveProduct = async ({
  suratJalanId,
}: {
  suratJalanId: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const productSuratJalan = await tx.suratJalanProduct.findMany({
        where: { suratJalanId },
      });

      return { productSuratJalan };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const orderDeliveryCancel = async ({
  suratJalanId,
  createdBy,
}: {
  suratJalanId: string;
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const updateSuratJalan = await tx.suratJalan.update({
        where: { suratJalanId },
        data: { status: 4, modifiedBy: createdBy },
        include: { suratJalanProduct: true },
      });

      if (updateSuratJalan) {
        const labelBoxId = _.map(
          updateSuratJalan.suratJalanProduct,
          "labelBoxId"
        );

        const updateStock = await tx.stokPorudct.updateMany({
          where: { labelBoxId: { in: labelBoxId } },
          data: { status: 2 },
        });

        return { updateStock, updateSuratJalan };
      }

      return { updateSuratJalan };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const orderDeliveryRecaive = async ({
  suratJalanId,
  recaiveDate,
  recaiveBy,
  recaiveNote,
  dataQty,
  createdBy,
}: {
  suratJalanId: string;
  recaiveDate: string;
  recaiveBy: string;
  recaiveNote?: string;
  dataQty: { suratJalanProductId: string; recaivedQty: number }[];
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const insertSuratJalan = await tx.suratJalan.update({
        where: { suratJalanId },
        data: {
          status: 3,
          recaiveBy,
          recaiveDate,
          recaiveNote,
          modifiedBy: createdBy,
        },
        include: {
          suratJalanProduct: true,
        },
      });

      if (insertSuratJalan) {
        const labelBoxId = _.map(
          insertSuratJalan.suratJalanProduct,
          "labelBoxId"
        );

        for (const record of dataQty) {
          await tx.suratJalanProduct.update({
            where: { suratJalanProductId: record.suratJalanProductId },
            data: { recaivedQty: record.recaivedQty, statusProduct: 4 },
          });
        }

        const updateStatusStock = await tx.stokPorudct.updateMany({
          where: { labelBoxId: { in: labelBoxId } },
          data: { status: 4 },
        });

        return { updateStatusStock };
      }

      return insertSuratJalan;
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

/** END SECTION DELIVERY ORDER */

/** SECTION REEDEM PACKAGE */
const addPackageReedem = async ({
  packageName,
  packageDesc,
  point,
  photo,
  limit,
  createdBy,
}: {
  packageName: string;
  packageDesc: string;
  point: number;
  photo: any;
  limit?: number;
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const PackageRedem = await tx.packageReedem.create({
        data: {
          packageName,
          packageDesc,
          point,
          photo,
          limit,
          createdBy,
        },
      });

      return PackageRedem;
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const updatePackageReedem = async ({
  packageId,
  packageName,
  packageDesc,
  point,
  photo,
  limit,
  createdBy,
}: {
  packageId: string;
  packageName: string;
  packageDesc: string;
  point: number;
  photo?: any;
  limit?: number;
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const PackageRedem = await tx.packageReedem.update({
        where: { packageId },
        data: {
          packageName,
          packageDesc,
          point,
          photo,
          limit,
          modifiedBy: createdBy,
        },
      });

      return PackageRedem;
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const inActivePackageReedem = async ({
  packageId,
  value,
  createdBy,
}: {
  packageId: string;
  value: boolean;
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const PackageRedem = await tx.packageReedem.update({
        where: { packageId },
        data: {
          inActive: value,
          modifiedBy: createdBy,
        },
      });

      return PackageRedem;
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const claimPackageReedem = async ({
  agentId,
  reedemId,
  createdBy,
}: {
  agentId: string;
  reedemId: string;
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const agent = await tx.agent.findUnique({ where: { agentId } });
      const packageRedem = await tx.redeem.update({
        where: { reedemId },
        data: {
          status: 2,
          modifiedBy: createdBy,
        },
      });

      return { packageRedem, agent };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const claimUserPackage = async ({
  agentId,
  userId,
  packageId,
  createdBy,
}: {
  agentId: string;
  userId: string;
  packageId: string;
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const findPoint = await tx.loyaltyPoint.findFirst({
        where: { userId },
      });

      const findUser = await tx.user.findFirst({
        where: { userId },
      });

      const findPackage = await tx.packageReedem.findUnique({
        where: { packageId },
      });

      const findAgent = await tx.agent.findUnique({ where: { agentId } });

      if (findPoint && findPackage) {
        if (findPoint.loyaltyPoint >= findPackage.point) {
          const findReedemUser = await tx.redeem.findMany({
            where: {
              userId,
              packageId,
            },
          });

          if (_.size(findReedemUser) === findPackage.limit) {
            throw new Error("This package reedem is limit");
          } else {
            const createRedeem = await tx.redeem.create({
              data: {
                userId,
                fullname: findUser?.fullname,
                email: findUser?.email,
                phone: findUser?.phone,
                packageId,
                packageName: findPackage.packageName,
                redemCode: nanoid(8),
                status: 1,
                createdBy,
                agentId: agentId,
              },
            });

            const updatePoint = await tx.loyaltyPoint.update({
              where: { pointId: findPoint.pointId },
              data: {
                loyaltyPoint: _.subtract(
                  findPoint.loyaltyPoint,
                  findPackage.point
                ),
                log: {
                  create: {
                    userId,
                    loyaltyPoint: `- ${String(findPackage.point)}`,
                    remark: `Reedem ${findPackage.packageName}`,
                    modifiedBy: createdBy,
                  },
                },
              },
            });

            return { createRedeem, updatePoint, findAgent };
          }
        }
      }

      return { findPoint, findPackage, findAgent };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const pageAllPackageRedeem = async ({ userId, skip, take }: pageAll) => {
  try {
    const [detail, allPackage, totalPackage] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
      }),
      prisma.packageReedem.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.packageReedem.count(),
    ]);

    return { detail, allPackage, totalPackage };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const packageRedeemPagination = async ({ skip, take }: paginations) => {
  try {
    const [result, count] = await prisma.$transaction([
      prisma.packageReedem.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.packageReedem.count(),
    ]);

    return { result, count };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const redeemPagination = async ({
  skip,
  take,
  userId,
}: {
  skip: number;
  take: number;
  userId: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const detail = await tx.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
      });

      const agentId = await tx.agent.findFirst({
        where: { email: { contains: detail?.email } },
      });

      const result = await tx.redeem.findMany({
        where: { agentId: agentId?.agentId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      });

      const count = await tx.redeem.count({
        where: { agentId: agentId && agentId.agentId },
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Status Redeem" },
        orderBy: { key: "asc" },
      });

      return { detail, result, count, statusMap };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const pageAllAgentRedeem = async ({ userId, skip, take }: pageAll) => {
  try {
    return prisma.$transaction(async (tx) => {
      const detail = await tx.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
      });

      const agentId = await tx.agent.findFirst({
        where: { email: { contains: detail?.email } },
      });

      const allRedeem = await tx.redeem.findMany({
        where: { agentId: agentId?.agentId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      });

      const totalRedeem = await tx.redeem.count({
        where: { agentId: agentId && agentId.agentId },
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Status Redeem" },
        orderBy: { key: "asc" },
      });

      return { detail, allRedeem, totalRedeem, statusMap };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const agentRedeemSearch = async ({
  value,
  userId,
}: {
  value: string;
  userId: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const detail = await tx.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullname: true,
          inActive: true,
          email: true,
          leader: true,
          roles: { select: { stringId: true } },
        },
      });

      const agentId = await tx.agent.findFirst({
        where: { email: { contains: detail?.email } },
      });

      const result = await tx.redeem.findMany({
        where: { agentId: agentId?.agentId, redemCode: { contains: value } },
        orderBy: { createdAt: "desc" },
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Status Redeem" },
        orderBy: { key: "asc" },
      });

      return { detail, result, statusMap };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const packageRedeemSearch = async ({ value }: valueSearch) => {
  try {
    const [result, statusMap] = await prisma.$transaction([
      prisma.packageReedem.findMany({
        where: {
          OR: [{ packageName: { contains: value } }],
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.stringMap.findMany({
        where: { objectName: "Redeem Agent" },
        orderBy: { key: "asc" },
      }),
    ]);

    return { result, statusMap };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const packageImage = async ({ packageId }: { packageId: string }) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.packageReedem.findUnique({
        where: { packageId },
        select: { photo: true },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

/** END SECTION REEDEM PACKAGE */

/** SECTION MOBILE */
const forgotPasswordUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const findEmail = await tx.user.findUnique({
        where: { email: email },
      });

      if (findEmail) {
        const resultUser = await tx.user.update({
          where: { email },
          data: {
            password,
            modifiedBy: "bySystem",
          },
        });

        return resultUser;
      } else {
        throw new Error(
          "Sorry, the email provided isn't linked to any active account. Please check the email address or consider signing up."
        );
      }
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const addUserMobile = async ({
  email,
  password,
  phone,
  dateOfBirth,
  fullname,
  roles,
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
          },
        });

        if (resultUser) {
          const stringMap = await tx.stringMap.findUnique({
            where: { stringId: roles },
          });

          if (stringMap) {
            const resultRoles = await tx.user.update({
              where: { userId: resultUser.userId },
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

            return resultRoles;
          }
        }

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

const findUser = async ({ tx, userId }: any) => {
  return await tx.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      fullname: true,
      phone: true,
      dateOfBirth: true,
      email: true,
      roles: true,
      leader: true,
    },
  });
};

const detailUserMob = async ({ userId }: { userId: string }) => {
  try {
    const [userDetail, stringRole] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userId },
        select: {
          fullname: true,
          phone: true,
          dateOfBirth: true,
          email: true,
          roles: true,
          leader: true,
        },
      }),
      prisma.stringMap.findMany({
        where: { objectName: "Roles" },
        select: { stringId: true, value: true },
      }),
    ]);

    return { userDetail, stringRole };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const dashboardDRMob = async () => {
  try {
    const thirtyDaysAgo = moment().subtract(90, "days").toDate();

    return prisma.$transaction(async (tx) => {
      const deliveryList = await tx.suratJalan.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        include: {
          suratJalanProduct: true,
        },
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Delivery Request" },
        orderBy: { key: "asc" },
      });

      return { deliveryList, statusMap };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const dashboardMemberMob = async ({
  userId,
  isOwner,
}: {
  userId: string;
  isOwner: boolean;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const pointLoyalty = await tx.loyaltyPoint.findFirst({
        where: { userId },
        select: { loyaltyPoint: true },
      });
      const historyPoint = await tx.loyaltyPointLog.findMany({
        where: { userId },
      });

      const currentDate = new Date();
      const campaign = await tx.campaign.findMany({
        where: {
          inActive: false,
          startDate: { lte: currentDate },
          endDate: { gte: currentDate },
        },
      });

      if (isOwner) {
        const dataOwner = await tx.boothOwner.findFirst({
          where: { userId },
        });

        const listMember = await tx.booth.findMany({
          where: { boothOwnerId: dataOwner?.boothOwnerId },
        });

        return {
          listMember,
          pointLoyalty,
          dataOwner,
          historyPoint,
          campaign,
        };
      }

      return { pointLoyalty, historyPoint, campaign };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const deleteBooth = async ({ boothId }: { boothId: string }) => {
  try {
    return prisma.$transaction(async (tx) => {
      const deleteBooth = await tx.booth.delete({
        where: { boothId },
      });

      return { deleteBooth };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const findDRMob = async ({ value }: { value: string }) => {
  try {
    return prisma.$transaction(async (tx) => {
      const drList = await tx.suratJalan.findMany({
        where: { noSurat: { contains: value } },
        include: {
          suratJalanProduct: true,
        },
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Delivery Request" },
        orderBy: { key: "asc" },
      });

      return { drList, statusMap };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const findProductDRMob = async ({ labelBoxId }: { labelBoxId: string[] }) => {
  try {
    return prisma.$transaction(async (tx) => {
      const productList = await tx.stokPorudct.findMany({
        where: { labelBoxId: { in: labelBoxId } },
      });

      return { productList };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const settingMob = async ({ userId }: { userId: string }) => {
  try {
    return prisma.$transaction(async (tx) => {
      const userDetail = await findUser({ tx, userId });

      return { userDetail };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const findAgentMob = async () => {
  try {
    const [result, lastNoSurat, lastNoOrder] = await prisma.$transaction([
      prisma.agent.findMany(),
      prisma.runningNumber.findUnique({
        where: { id: "ba1ea257-d5e8-11ee-a707-1692f949cb11" },
        select: { id: true, value: true },
      }),
      prisma.runningNumber.findUnique({
        where: { id: "ba1ea257-d5e8-11ee-a707-1692f949cb22" },
        select: { id: true, value: true },
      }),
    ]);

    return { result, lastNoSurat, lastNoOrder };
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const findStockBox = async ({ value }: { value?: string }) => {
  try {
    const [result] = await prisma.$transaction([
      prisma.stokPorudct.findMany({
        where: { labelBoxs: value },
      }),
    ]);

    return result;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const newDeliveyOrderMob = async ({
  noSurat,
  orderNo,
  shippingDate,
  agentId,
  customerName,
  deliveryAddress,
  deliveryNote,
  totalWeight,
  createdBy,
  product,
  updateData,
}: {
  noSurat: string;
  orderNo: string;
  shippingDate: Date;
  agentId: string;
  customerName: string;
  deliveryAddress: string;
  totalWeight: number;
  deliveryNote?: string;
  createdBy: string;
  product: {
    labelBox: string;
    labelBoxId: string;
    shipQty: number;
    statusProduct: number;
  }[];
  updateData: any[];
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const createDR = await tx.suratJalan.create({
        data: {
          noSurat,
          orderNo,
          shippingDate,
          agentId,
          customerName,
          deliveryAddress,
          deliveryNote,
          totalWeight,
          createdBy,
          status: 1,
          suratJalanProduct: { createMany: { data: product } },
        },
      });

      if (createDR) {
        const labelCodeIds = _.map(product, "labelBoxId");

        const updateStock = await tx.stokPorudct.updateMany({
          where: { productId: { in: labelCodeIds } },
          data: { status: 2 },
        });

        if (updateStock) {
          for (const updateItem of updateData) {
            await tx.runningNumber.updateMany({
              where: { id: updateItem.id }, // Condition to match record
              data: { value: updateItem.value }, // New value to set
            });
          }
        }
      }

      return { createDR };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const changePasswordMob = async ({
  userId,
  password,
  createdBy,
}: {
  userId: string;
  password: string;
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const changePass = await tx.user.update({
        where: { userId },
        data: { password, modifiedBy: createdBy },
      });

      return { changePass };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const addDetailBoothOwner = async ({
  userId,
  alamatOwner,
  facebook,
  instagram,
  ecommerce,
  berdiriSejak,
  createdBy,
}: {
  userId: string;
  alamatOwner: string;
  instagram?: string;
  facebook?: string;
  ecommerce?: string;
  berdiriSejak: string;
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const detailUser = await tx.user.findUnique({
        where: { userId },
      });

      if (detailUser) {
        const addBoothOwner = await tx.boothOwner.create({
          data: {
            userId: detailUser.userId,
            alamatOwner,
            facebook,
            instagram,
            ecommerce,
            dateEstablishment: berdiriSejak,
            fullname: detailUser.fullname,
            phone: detailUser.phone,
            email: detailUser.email,
            createdBy,
          },
        });

        return { addBoothOwner };
      }
      return { detailUser };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const findUserBooth = async ({ email }: { email: string }) => {
  try {
    return prisma.$transaction(async (tx) => {
      const findUser = await tx.user.findUnique({
        where: { email },
        select: { userId: true },
      });

      if (findUser) {
        const findBooth = await tx.booth.findFirst({
          where: { userId: findUser.userId },
        });

        if (findBooth) {
          return { findUser, findBooth };
        }

        return { findUser };
      }

      return { findUser };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const addUserBooth = async ({
  userId,
  boothOwnerId,
  email,
  alamatBooth,
  photoBooth,
  createdBy,
}: {
  boothOwnerId: string;
  email: string;
  userId: string;
  alamatBooth: string;
  photoBooth: Buffer;
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const findUser = await tx.user.findUnique({
        where: { email },
      });

      const addBooth = await tx.booth.create({
        data: {
          alamatBooth,
          userId,
          fullname: findUser?.fullname || "",
          email: findUser?.email || "",
          phone: findUser?.phone || "",
          photoBooth: photoBooth,
          createdBy,
          boothOwnerId,
        },
      });

      return { addBooth };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const addLoyaltyUser = async ({
  userId,
  label,
  createdBy,
}: {
  userId: string;
  label: string;
  createdBy: string;
}) => {
  try {
    return prisma.$transaction(async (tx) => {
      const existScan = await tx.logLoyalty.findMany({
        where: { labelProduct: label, status: 1 },
      });

      if (_.isEmpty(existScan)) {
        const findProduct = await tx.labelProduct.findFirst({
          where: { labelCode: label },
        });

        if (!findProduct) {
          throw new Error("The QR-Code is invalid...");
        }

        const product = await tx.product.findFirst({
          where: { productId: findProduct.productId },
        });
        const currentDate = new Date();

        const pointCampaign = await tx.campaign.findFirst({
          where: {
            campaignId: product?.campaignId || "",
            inActive: false,
            startDate: { lte: currentDate },
            endDate: { gte: currentDate },
          },
        });

        const existPoint = await tx.loyaltyPoint.findFirst({
          where: { userId },
        });

        const loyaltyPoint = pointCampaign
          ? pointCampaign.loyaltyPoint
          : product?.basePoint;

        if (existPoint) {
          await tx.loyaltyPoint.update({
            where: { pointId: existPoint.pointId },
            data: {
              loyaltyPoint: _.add(
                existPoint.loyaltyPoint,
                Number(loyaltyPoint)
              ),
              log: {
                create: {
                  userId,
                  loyaltyPoint: `+ ${String(loyaltyPoint)}`,
                  remark: "User add point product",
                  productId: findProduct.productId,
                  productCode: findProduct.productCode,
                  productName: findProduct.productName,
                  labelId: findProduct.labelId,
                  labelProducts: findProduct.labelCode,
                  scanDate: currentDate,
                  campaignId: pointCampaign?.campaignId || null,
                  createdBy,
                },
              },
            },
          });
        } else {
          await tx.loyaltyPoint.create({
            data: {
              userId,
              loyaltyPoint,
              createdBy,
              log: {
                create: {
                  userId,
                  loyaltyPoint: `+ ${String(loyaltyPoint)}`,
                  remark: "User add point product",
                  productId: findProduct.productId,
                  productCode: findProduct.productCode,
                  productName: findProduct.productName,
                  labelId: findProduct.labelId,
                  labelProducts: findProduct.labelCode,
                  scanDate: currentDate,
                  campaignId: pointCampaign?.campaignId || null,
                  createdBy,
                },
              },
            },
          });
        }

        await tx.logLoyalty.create({
          data: { userId, labelProduct: label, status: 1 },
        });

        return null;
      } else {
        const findUser = await tx.logLoyalty.findFirst({
          where: { userId },
        });
        if (!findUser) {
          await tx.logLoyalty.create({
            data: { userId, labelProduct: label, status: 2 },
          });

          throw new Error(
            "Other users have already used the points in this product."
          );
        } else {
          throw new Error("This product point was entered.");
        }
      }
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const dashboardPackageRedeem = async ({ userId }: { userId: string }) => {
  try {
    return prisma.$transaction(async (tx) => {
      const findPoint = await tx.loyaltyPoint.findFirst({ where: { userId } });
      const getPackage = await tx.packageReedem.findMany({
        where: {
          inActive: false,
        },
      });
      const getRedeem = await tx.redeem.findMany({
        where: {
          userId,
        },
      });

      return { findPoint, getPackage, getRedeem };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const dashboardmyRedeem = async ({ userId }: { userId: string }) => {
  try {
    return prisma.$transaction(async (tx) => {
      const getRedeem = await tx.redeem.findMany({
        where: {
          userId,
        },
        orderBy: { createdAt: "desc" },
      });

      const statusMap = await tx.stringMap.findMany({
        where: { objectName: "Status Redeem" },
        orderBy: { key: "asc" },
      });

      const manyAgent = await tx.agent.findMany();

      return { getRedeem, statusMap, manyAgent };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

const listAgentMobile = async () => {
  try {
    return prisma.$transaction(async (tx) => {
      const getAgent = await tx.agent.findMany();

      return { getAgent };
    });
  } catch (e: any) {
    throw new Error(e.message);
  }
};

/** END SECTION MOBILE */

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
  agentExport,

  //** PRODUCT */
  pageAllProduct,
  pageAllMemberBooth,
  productSearch,
  addProduct,
  productPagination,
  batchAddProduct,
  productExport,

  //** BOOTH OWNER */
  pageAllOwnerBooth,
  boothOwnerPagination,
  boothMemberPagination,
  boothOwnerSearch,
  boothMemberSearch,
  boothMemberImage,
  boothOwnerExport,
  boothMemberExport,

  /** LABELING */
  pageAllLabeling,
  addLabelProduct,
  labelProductPagination,
  labelProductSearch,
  labelProductPrinter,

  /** LABELING BOX */
  pageAllLabelingBox,
  pageAllLabelingBoxChild,
  labelBoxFind,
  labelBoxPagination,
  labelBoxSearch,
  addLabelBox,
  addLabelToBox,
  removeProductBox,
  labelBoxProductPagination,
  labelBoxProductSearch,
  labelBoxPrinter,

  /** STOCK PRODUCT */
  pageAllStockProduct,
  stockProdutPagination,
  stockProdutRangeSearch,
  stockProdutSearch,
  stockBox,
  addStockLocation,

  //** POINT LOYALTY */
  pageAllLoyalty,
  pageAllLoyaltyLog,
  loyaltyPagination,
  loyaltyLogPagination,
  loyaltySearch,
  loyaltyLogSearch,
  loyaltyPenaltyPoint,

  //** CAMPAING POINT */
  pageAllPoCam,
  addCampaign,
  campaignPagination,
  editCampaign,
  campaignSearch,
  inActiveCampaign,
  campaignImage,

  /** DASHBOARD */
  pageDashboard,

  /** DELIVERY ORDER */
  pageAllDeliveryOrder,
  deliveryOrderPagination,
  deliveryOrderSearch,
  deliveryOrderProductPagination,
  pageAllDeliveryOrderProduct,
  deliveryOrderFind,
  getRecaiveProduct,
  orderDeliveryRecaive,
  orderDeliveryCancel,

  /** Package Redem */
  pageAllPackageRedeem,
  packageRedeemSearch,
  packageImage,
  packageRedeemPagination,
  inActivePackageReedem,
  addPackageReedem,
  updatePackageReedem,
  agentRedeemSearch,
  pageAllAgentRedeem,
  redeemPagination,
  claimPackageReedem,

  /** Mobile */
  detailUserMob,
  forgotPasswordUser,
  addUserMobile,
  dashboardDRMob,
  dashboardMemberMob,
  findDRMob,
  changePasswordMob,
  settingMob,
  findAgentMob,
  findStockBox,
  newDeliveyOrderMob,
  findProductDRMob,
  addDetailBoothOwner,
  findUserBooth,
  addUserBooth,
  deleteBooth,
  addLoyaltyUser,
  dashboardPackageRedeem,
  dashboardmyRedeem,
  claimUserPackage,
  listAgentMobile,
};
