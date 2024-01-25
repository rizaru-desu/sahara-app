import { addBooth } from "@/app/utils/db/agentDB";
import { addLabelProduct, addProduct } from "@/app/utils/db/productDB";
import { validateToken } from "@/app/utils/token/validate";
import _ from "lodash";
import moment from "moment";
import { type NextRequest, NextResponse } from "next/server";
import z from "zod";

const Schema = z
  .object({
    productId: z.string(),
    productCode: z.string(),
    barcodeType: z.number(),
    status: z.number(),
    bestBefore: z.date(),
    createBy: z.string(),
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
      data: {
        productId: json.productId,
        productCode: json.productCode,
        status: json.status,
        barcodeType: json.barcodeType,
        bestBefore: moment(json.bestBefore).toDate(),
        createBy: json.createBy,
      },
    });

    if (tokenValidated) {
      const result = await addLabelProduct({
        productId: validated.productId,
        productCode: validated.productCode,
        status: validated.status,
        barcodeType: validated.barcodeType,
        bestBefore: validated.bestBefore,
        createBy: validated.createBy,
      });

      return NextResponse.json(
        {
          result: "OK",
          message: `Succesfully add label ${result.productCode}`,
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
