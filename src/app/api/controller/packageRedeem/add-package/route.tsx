import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import { addPackageReedem } from "@/app/utils/db/controllerDB";
import _ from "lodash";
import z from "zod";

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

    const photos = formData.getAll("photo") as File[];
    const namepackage = formData.get("packageName") as string;
    const point = formData.get("point") as any;
    const description = formData.get("packageDesc") as string;
    const createdBy = formData.get("createdBy") as string;
    const limit = formData.get("limit") as any;

    if (tokenValidated) {
      const fileToStorage = photos[0];
      const arrayBuffer = await fileToStorage.arrayBuffer();
      const base64String = arrayBufferToBase64(arrayBuffer);

      const { packageName } = await addPackageReedem({
        packageDesc: description,
        packageName: namepackage,
        photo: base64String,
        createdBy: createdBy,
        point: Number(point),
        limit: Number(limit),
      });

      return NextResponse.json(
        {
          message: `${packageName} has been created`,
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
