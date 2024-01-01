import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { validateToken } from "@/app/utils/token/validate";
import { findUser } from "@/app/utils/db/userDB";
import { cookies } from "next/headers";
import _ from "lodash";

const paramsSchema = z
  .object({
    guid: z.string(),
  })
  .strict();

function validateParamsSchema({ data }: { data: any }) {
  try {
    const parseData = paramsSchema.parse(data);
    return parseData;
  } catch (error: any) {
    if (error.issues && error.issues.length > 0) {
      const validationErrors = error.issues.map((issue: any) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      const errorMessage = validationErrors
        .map((error: any) => `Field '${error.path}' ${error.message}`)
        .join(" \n");

      throw new Error(errorMessage);
    } else {
      throw new Error("Invalid Schema.");
    }
  }
}

interface User {
  userId: string;
  fullname: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  email: string;
  password: string;
  roleId: string;
  verification: boolean;
  createBy: string | null;
  modifiedBy: string | null;
  createdAt: Date;
  modifedAt: Date;
  StringMap?: {
    key: string;
    value: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization") as any;

    const tokenWithoutBearer = token?.replace(/^Bearer\s+/i, "") || undefined;
    const userData = request.cookies.get("userData");

    const tokenValidated = (await validateToken({
      token: _.isEmpty(tokenWithoutBearer)
        ? userData?.value
        : tokenWithoutBearer,
    })) as any;

    if (tokenValidated) {
      const { userId } = tokenValidated;

      const user: User | null = await findUser({
        userId,
      });

      return NextResponse.json(
        {
          result: "OK",
          data: {
            fullname: user?.fullname,
            phone: user?.phone,
            dateOfBirth: user?.dateOfBirth,
            email: user?.email,
            roleId: {
              key: user?.StringMap?.key,
              value: user?.StringMap?.value,
            },
            verification: false,
            createBy: "bySystem",
            modifiedBy: null,
            createdAt: "2023-12-30T17:48:58.606Z",
            modifedAt: "2023-12-30T17:48:58.606Z",
          },
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          result: "OK",
          message: "Invalid token. Authentication failed.",
        },
        {
          status: 401,
        }
      );
    }
  } catch (error: any) {
    // Return a JSON response with a specific HTTP status code
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500, // You can replace 500 with the desired status code
      }
    );
  }
}
