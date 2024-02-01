import { type NextRequest, NextResponse } from "next/server";
import { read, utils } from "xlsx";
import _ from "lodash";

import z from "zod";
import { validateToken } from "@/app/utils/token/validate";
import { batchAddProduct } from "@/app/utils/db/controllerDB";

const Schema = z
  .object({
    format: z.literal(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ),
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

    const formData = await request.formData();

    const files = formData.getAll("files") as File[];

    const createdBy = formData.get("createdBy");

    validateSchema({
      data: { format: files[0].type, createdBy },
    });

    if (tokenValidated) {
      const fileToStorage = files[0];

      const arrayBuffer = await fileToStorage.arrayBuffer();

      const base64String = arrayBufferToBase64(arrayBuffer);

      const wb = read(base64String, { type: "base64", cellDates: true });

      const excel = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

      const newArray = _.map(excel, (item: any) => ({
        ...item,
        createdBy,
      }));

      await batchAddProduct({ dataProduct: newArray as [] });

      return NextResponse.json(
        {
          message: "Upload completed",
          data: `Successfully upload`,
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

function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(arrayBuffer);
  const base64String = btoa(
    String.fromCharCode.apply(null, Array.from(uint8Array))
  );
  return base64String;
}
