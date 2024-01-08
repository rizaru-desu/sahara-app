import { addBooth, addCustomer } from "@/app/utils/db/customerDB";
import { addStringMap } from "@/app/utils/db/stringMapDB";
import { type NextRequest, NextResponse } from "next/server";
import z from "zod";

//region validation input schema
const Schema = z
  .object({
    alamatBooth: z.string(),
    gelocation: z.string(),
    photoBooth: z.string(),
    userId: z.string(),
    customerId: z.string(),
    createBy: z.string().optional(),
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
//endregion

//region post add string map
export async function POST(request: NextRequest) {
  try {
    //get the details provided by user
    const json = await request.json();

    //understand whether the details are correct as expect.
    const validated = validateSchema({
      data: json,
    });

    const result = await addBooth({
      alamatBooth: validated.alamatBooth,
      geolocation: validated.gelocation,
      photoBooth: validated.photoBooth,
      userId: validated.userId,
      customerId: validated.customerId,
    });

    return NextResponse.json(
      {
        result: "OK",
        message: result,
      },
      {
        status: 200,
      }
    );
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
