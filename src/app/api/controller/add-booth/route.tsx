import { addBooth } from "@/app/utils/db/customerDB";
import { validateToken } from "@/app/utils/token/validate";
import _ from "lodash";
import { type NextRequest, NextResponse } from "next/server";

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

    const files = formData.getAll("photoBooth") as File[];
    const alamatBooth = formData.get("alamatBooth");
    const createBy = formData.get("createBy");
    const customerId = formData.get("customerId");

    console.log("Files:", files);
    console.log("Alamat Booth:", alamatBooth);
    console.log("Create By:", createBy);
    console.log("Customer ID:", customerId);

    if (tokenValidated) {
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
