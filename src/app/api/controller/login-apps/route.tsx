import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import { serialize } from "cookie";
import { generateToken } from "@/app/utils/token/generate";
import { findByEmail } from "@/app/utils/db/userDB";
import { findStringMap } from "@/app/utils/db/stringMapDB";

//region validation input schema
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
//endregion

//region post login user
export async function POST(request: NextRequest) {
  try {
    //get the details provided by user
    const json = await request.json();

    //understand whether the details are correct as expect.
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
      // Save user data to a cookie
      const userCookie = serialize("userData", String(userData.token), {
        httpOnly: process.env.NODE_ENV === "development" ? false : true,
        secure: true,
        maxAge: 3 * 60 * 60, //maxAge: 60 * 60 * 24, // Cookie will expire in 1 day (adjust as needed)
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
//endregion
