import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import { addAgent } from "@/app/utils/db/controllerDB";
import z from "zod";
import _ from "lodash";

const Schema = z
  .object({
    email: z.string().email(),
    customerName: z.string(),
    picName: z.string(),
    picPhone: z.string().refine(
      (value) => {
        return /^\+62\d{9,}$/.test(value);
      },
      { message: "Invalid phone number format" }
    ),
    alamatToko: z.string(),
    noNpwp: z.string(),
    phoneAgent: z.string(),
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

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
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

    const formattedNPWP = resultValid.noNpwp
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d{3})(\d{3})(\d)(\d{3})(\d{3})/, "$1.$2.$3.$4-$5.$6");

    if (tokenValidated) {
      await addAgent({
        email: resultValid.email,
        customerName: toTitleCase(resultValid.customerName),
        picName: toTitleCase(resultValid.picName),
        picPhone: resultValid.picPhone,
        alamatToko: resultValid.alamatToko,
        noNpwp: formattedNPWP,
        phoneAgent: resultValid.phoneAgent,
        createdBy: resultValid.createdBy,
      });

      return NextResponse.json(
        {
          message: `Agent ${resultValid.customerName} has been successfully created.`,
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
