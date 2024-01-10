import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import _ from "lodash";
import z from "zod";
import { findRoleStringMap } from "@/app/utils/db/stringMapDB";

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
      const result = await findRoleStringMap();

      return NextResponse.json(
        {
          result: "OK",
          data: result,
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
