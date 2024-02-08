import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import { pageAllLabelingBox } from "@/app/utils/db/controllerDB";
import _ from "lodash";
import z from "zod";

const Schema = z
  .object({
    skip: z.number(),
    take: z.number(),
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
      const { userId } = tokenValidated;
      const { detail, allLabelBox, totalLabelBox, allLabel, totalLabel } =
        await pageAllLabelingBox({
          skip: resultValid.skip,
          take: resultValid.take,
          userId: userId,
        });

      const labelBoxResult = _.map(allLabelBox, (item) => {
        return Object.assign(
          {
            id: item.labelBoxId,
            totalProduct: _.size(item.labelProduct),
          },
          _.omit(item, "labelBoxId", "labelProduct")
        );
      });

      const labelResult = _.map(allLabel, (item) => {
        return Object.assign(
          {
            id: item.labelId,
          },
          _.omit(item, "labelId")
        );
      });

      return NextResponse.json(
        {
          allLabelBox: labelBoxResult,
          userDetail: detail,
          allLabel: labelResult,
          countLabel: totalLabel,
          countLabelBox: totalLabelBox,
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
