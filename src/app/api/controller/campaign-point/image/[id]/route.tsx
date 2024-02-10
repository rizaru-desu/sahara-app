import { campaignImage } from "@/app/utils/db/controllerDB";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const slug = params.id;
    const result = await campaignImage({ campaignId: slug });

    if (!result?.photo) {
      return NextResponse.json(
        {
          message: "Photo not found",
        },
        {
          status: 404,
        }
      );
    }

    const bufferData = Buffer.from(result?.photo);

    return new Response(bufferData, {
      status: 200,
      headers: {
        "Content-Type": "image/jpg",
      },
    });
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
