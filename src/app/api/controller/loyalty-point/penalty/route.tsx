import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import { loyaltyPenaltyPoint } from "@/app/utils/db/controllerDB";
import _ from "lodash";
import z from "zod";

const Schema = z
  .object({
    pointId: z.string(),
    userId: z.string(),
    point: z.number(),
    loyaltyPoint: z.string(),
    remarks: z.string(),
    createdBy: z.string().optional(),
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

    const resultValid = validateSchema({
      data: json,
    });

    if (tokenValidated) {
      const { penalty } = await loyaltyPenaltyPoint({
        pointId: resultValid.pointId,
        userId: resultValid.userId,
        point: resultValid.point,
        loyaltyPoint: resultValid.loyaltyPoint,
        remark: resultValid.remarks,
        createdBy: resultValid.createdBy,
      });

      return NextResponse.json(
        {
          message: `The user ${penalty.userIdData?.fullname} received a penalty of ${resultValid.loyaltyPoint}.`,
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
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
