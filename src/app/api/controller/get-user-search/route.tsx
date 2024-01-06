import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import _ from "lodash";
import z from "zod";
import { findManyUserFilter, manyUserPagination } from "@/app/utils/db/userDB";

//region validation input schema
const createUserSchema = z
  .object({
    value: z.string(),
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

    //get the details provided by user
    const json = await request.json();

    //understand whether the details are correct as expect.
    const resultValid = validateSchema({
      data: json,
    });

    if (tokenValidated) {
      const { result, totalCount } = await findManyUserFilter({
        value: resultValid.value,
      });

      const updatedUser = _.map(result, (item) => {
        return {
          ...item,
          id: item.userId,
        };
      });

      return NextResponse.json(
        {
          result: "OK",
          data: updatedUser,
          countUser: totalCount,
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
