import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import { pageAllLabeling } from "@/app/utils/db/controllerDB";
import _ from "lodash";
import z from "zod";
import moment from "moment";

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
      const { detail, allProduct, allLabel, totalLabel } =
        await pageAllLabeling({
          skip: resultValid.skip,
          take: resultValid.take,
          userId: userId,
        });

      const finalResult = _.map(allProduct, (item) => {
        return Object.assign(
          {
            productName: `${item.productName} ${item.unit}`,
            productCode: item.productCode,
            expiredPeriod: item.expiredPeriod,
            productId: item.productId,
          },
          _.omit(
            item,
            "productId",
            "productName",
            "weight",
            "unit",
            "createdAt",
            "modifedAt",
            "modifiedBy",
            "createdBy"
          )
        );
      });

      const labelResult = _.map(allLabel, (item) => {
        return Object.assign(
          {
            id: item.labelId,
            bestBefore: moment(item.bestBefore).format("DD/MM/YYYY"),
          },
          _.omit(item, "labelId", "bestBefore")
        );
      });

      return NextResponse.json(
        {
          allProduct: finalResult,
          userDetail: detail,
          allLabel: labelResult,
          countLabel: totalLabel,
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
