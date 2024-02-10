import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import { addCampaign, editCampaign } from "@/app/utils/db/controllerDB";
import _ from "lodash";
import moment from "moment";

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
    const campaignId = formData.get("campaignId") as string;
    const campaignName = formData.get("campaignName") as string;
    const startDate = formData.get("startDate") as any;
    const endDate = formData.get("endDate") as any;
    const removeProductId = formData.get("removeProductId") as any;
    const productId = formData.get("productId") as any;
    const loyaltyPoint = formData.get("loyaltyPoint") as any;
    const description = formData.get("description") as string;
    const createdBy = formData.get("createdBy") as string;

    if (tokenValidated) {
      const fileToStorage = photos[0];

      if (fileToStorage) {
        const arrayBuffer = await fileToStorage.arrayBuffer();
        const base64String = arrayBufferToBase64(arrayBuffer);

        await editCampaign({
          campaignId,
          campaignName,
          removeProductId: _.split(removeProductId, ","),
          startDate: moment(startDate).toDate(),
          endDate: moment(endDate).toDate(),
          productId: _.split(productId, ","),
          loyaltyPoint: Number(loyaltyPoint),
          photo: base64String,
          description,
          createdBy,
        });
      } else {
        await editCampaign({
          campaignId,
          campaignName,
          removeProductId: _.split(removeProductId, ","),
          startDate: moment(startDate).toDate(),
          endDate: moment(endDate).toDate(),
          productId: _.split(productId, ","),
          loyaltyPoint: Number(loyaltyPoint),
          description,
          createdBy,
        });
      }

      return NextResponse.json(
        {
          message: `Campaign ${campaignName} has been successfully updates.`,
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
