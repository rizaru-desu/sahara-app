import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import { findUser } from "@/app/utils/db/userDB";
import _ from "lodash";

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
            createBy: user?.createBy,
            modifiedBy: user?.modifiedBy,
            createdAt: user?.createdAt,
            modifedAt: user?.modifedAt,
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
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
