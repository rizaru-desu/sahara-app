import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import { serialize } from "cookie";
import { generateToken } from "@/app/utils/token/generate";
import { findByEmail } from "@/app/utils/db/userDB";
import { findStringMap } from "@/app/utils/db/stringMapDB";

const createUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .strict();

function validateSchema({ data }: { data: any }) {
  try {
    const parseData = createUserSchema.parse(data);
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

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();

    const resultValid = validateSchema({
      data: json,
    });

    const userData = await generateToken({
      email: resultValid.email,
      password: resultValid.password,
    });

    const findAccount = await findByEmail({ email: resultValid.email });

    const findRoles = await findStringMap({ id: findAccount?.roleId || "" });

    if (findRoles?.key !== 100) {
      const userCookie = serialize("userData", String(userData.token), {
        httpOnly: process.env.NODE_ENV === "development" ? false : true,
        secure: true,
        maxAge: 60 * 60 * 24, //maxAge: 60 * 60 * 24,  // Cookie will expire in 1 day (adjust as needed), 3 * 60 * 60 // 3 hourss
        sameSite: true,
        path: "/",
      });

      return NextResponse.json(
        {
          result: "OK",
          userData,
        },
        {
          status: 200,
          headers: {
            "Set-Cookie": userCookie,
          },
        }
      );
    } else {
      throw new Error("Sorry, your account does not have access.");
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
