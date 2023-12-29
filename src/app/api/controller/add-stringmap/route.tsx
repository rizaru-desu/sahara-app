import { addStringMap } from "@/app/utils/db/stringMapDB";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

//region validation input schema
const addStringMapSchema = z
  .object({
    objectName: z.string(),
    key: z.number(),
    value: z.string(),
    createBy: z.string().optional(),
  })
  .strict();

function validateStringMapSchema({ data }: { data: any }) {
  try {
    const parseData = addStringMapSchema.parse(data);
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
    const validatedStringMap = validateStringMapSchema({
      data: json,
    });

    await addStringMap({
      data: { ...validatedStringMap, stringId: uuidv4().toUpperCase() },
    });
    return NextResponse.json(
      {
        result: "OK",
        message: `The String Map (${json.objectName}: ${json.value}) has been successfully created.`,
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
