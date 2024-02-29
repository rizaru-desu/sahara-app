import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import { findStockBox, newDeliveyOrderMob } from "@/app/utils/db/controllerDB";
import z from "zod";
import _ from "lodash";
import moment from "moment";

const Schema = z
  .object({
    data: z.any(),
    createdBy: z.string(),
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
      const runningNumber = [
        {
          id: "ba1ea257-d5e8-11ee-a707-1692f949cb11",
          value: Number(_.last(_.split(resultValid.data.noSurat, "FG/OUT/"))),
        },
        {
          id: "ba1ea257-d5e8-11ee-a707-1692f949cb22",
          value: Number(resultValid.data.noOrder),
        },
      ];

      const { createDR } = await newDeliveyOrderMob({
        noSurat: resultValid.data.noSurat,
        orderNo: resultValid.data.noOrder,
        shippingDate: moment(resultValid.data.shippingDate).toDate(),
        agentId: resultValid.data.agentId,
        customerName: resultValid.data.customerName,
        deliveryAddress: resultValid.data.deliveryAddress,
        deliveryNote: resultValid.data.deliveryNote,
        totalWeight: resultValid.data.totalWeight,
        createdBy: resultValid.createdBy,
        status: resultValid.data.noSurat,
        product: _.map(resultValid.data.productList, (product) => {
          return _.assign({}, product, {
            shipQty: product.shipQty,
            labelBox: String(product.labelBox),
            labelBoxId: String(product.labelBoxId),
            stockId: String(product.stockId),
            createdBy: String(resultValid.createdBy),
            statusProduct: product.status,
          });
        }),
        updateData: runningNumber,
      });
      return NextResponse.json(
        {
          message: `No DR ${createDR.noSurat} has been created.`,
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
