import { addBooth } from "@/app/utils/db/agentDB";
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
    const alamatBooth = formData.get("alamatBooth") as string;
    const createBy = formData.get("createBy") as string;
    const agentId = formData.get("agentId") as string;
    const geolocation = formData.get("latlong") as string;

    if (tokenValidated) {
      const fileToStorage = files[0];

      const arrayBuffer = await fileToStorage.arrayBuffer();

      const base64String = arrayBufferToBase64(arrayBuffer);

      await addBooth({
        alamatBooth,
        photoBooth: base64String,
        geolocation,
        agentId,
        createBy,
      });
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

function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = "";
  uint8Array.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}
