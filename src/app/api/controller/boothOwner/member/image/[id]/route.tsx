import { boothMemberImage } from "@/app/utils/db/controllerDB";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const slug = params.id;
    const result = await boothMemberImage({ boothId: slug });

    if (!result?.photoBooth) {
      return NextResponse.json(
        {
          message: "Photo not found",
        },
        {
          status: 404,
        }
      );
    }

    const bufferData = Buffer.from(result?.photoBooth);

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
