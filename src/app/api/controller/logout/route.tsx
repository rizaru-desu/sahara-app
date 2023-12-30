import { type NextRequest, NextResponse } from "next/server";

//region post logout user
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      {
        result: "OK",
      },
      {
        status: 200,
      }
    );

    response.cookies.set("userData", "", {
      httpOnly: true,
      expires: new Date(0), // expires now!
    });

    return response;
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
//endregion
