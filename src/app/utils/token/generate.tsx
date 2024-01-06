import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "process";
import { findByEmail } from "../db/userDB";

const prisma = new PrismaClient();

export const generateToken = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const user = (await findByEmail({ email })) as any;

    if (!user) {
      throw new Error(
        "Unable to find the user. Please check if the user exists and try again."
      );
    } else {
      if (await bcrypt.compare(password, user.password)) {
        if (!env.JWT_SECRET) {
          throw new Error("JWT_SECRET is not defined in the environment.");
        }

        const token = jwt.sign({ userId: user.userId }, env.JWT_SECRET, {
          expiresIn: "24hr",
        });

        await prisma.authToken.create({
          data: {
            token,
            userId: user.userId,
          },
        });

        const userData: any = {
          token: token,
          userId: user.userId,
          fullname: user.fullname,
          phone: user.phone,
          email: user.email,
          createdAt: user.createdAt,
        };
        return userData;
      } else {
        throw new Error(
          "Incorrect password. Please check your credentials and try again."
        );
      }
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};
