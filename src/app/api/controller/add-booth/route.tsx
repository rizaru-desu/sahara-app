import { addBooth } from "@/app/utils/db/customerDB";
import { validateToken } from "@/app/utils/token/validate";
import _ from "lodash";
import { type NextRequest, NextResponse } from "next/server";
import z from "zod";

const Schema = z
  .object({
    alamatBooth: z.string(),
    gelocation: z.string(),
    photoBooth: z.string(),
    userId: z.string(),
    customerId: z.string(),
    createBy: z.string().optional(),
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
    const token = request.headers.get("Authorization") as any;

    const tokenWithoutBearer = token?.replace(/^Bearer\s+/i, "") || undefined;
    const userData = request.cookies.get("userData");

    const tokenValidated = (await validateToken({
      token: _.isEmpty(tokenWithoutBearer)
        ? userData?.value
        : tokenWithoutBearer,
    })) as any;

    const json = await request.json();

    const validated = validateSchema({
      data: json,
    });

    if (tokenValidated) {
      await addBooth({
        alamatBooth: validated.alamatBooth,
        geolocation: validated.gelocation,
        photoBooth: validated.photoBooth,
        userId: validated.userId,
        customerId: validated.customerId,
      });

      return NextResponse.json(
        {
          result: "OK",
          message: "Succesfully registered the booth",
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
