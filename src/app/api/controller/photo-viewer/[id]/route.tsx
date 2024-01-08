import { findPhoto } from "@/app/utils/db/customerDB";
import { type NextRequest, NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const slug = params.id;
    const result = await findPhoto({ boothId: slug });

    if (!result?.photoBooth) {
      // Handle the case where photoBooth is not found or is empty
      return NextResponse.json(
        {
          message: "Photo not found",
        },
        {
          status: 404, // or the appropriate status code
        }
      );
    }
    const bufferData = Buffer.from(result?.photoBooth);
    const base64String = bufferData.toString("base64");

    var byteString = atob(base64String);
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var intArray = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    var imageBlob = new Blob([intArray], { type: "image/png" });

    return new Response(imageBlob, {
      status: 200,
      headers: {
        "Content-Type": "image/jpg",
      },
    });
  } catch (error: any) {
    // Return a JSON response with a specific HTTP status code
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500, // You can replace 500 with the desired status code
      }
    );
  }
}
