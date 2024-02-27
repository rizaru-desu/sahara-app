import { type NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import { generateToken, loginUser } from "@/app/utils/db/controllerDB";
import z from "zod";
import _ from "lodash";

const Schema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .strict();

function validateSchema({ data }: { data: any }) {
  try {
    const parseData = Schema.parse(data);
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

    const { user } = await loginUser({ email: resultValid.email });

    if (user) {
      if (!user?.inActive) {
        const generateTokens = await generateToken({
          userId: user?.userId,
          userPassword: resultValid.password,
          dbPassword: user?.password,
        });

        const tokenData: any = {
          token: generateTokens.token,
          userId: user.userId,
          fullname: user.fullname,
          phone: user.phone,
          email: user.email,
          createdAt: user.createdAt,
        };

        return NextResponse.json(
          {
            userData: tokenData,
          },
          {
            status: 200,
          }
        );
      } else {
        throw new Error("Unfortunately, your account is no longer active.");
      }
    } else {
      throw new Error(
        "Unable to find the user. Please check if the user exists and try again."
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
