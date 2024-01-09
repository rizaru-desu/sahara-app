import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import bcrypt from "bcrypt";
import { createUser, deleteUser, findByEmail } from "@/app/utils/db/userDB";
import sendMailer from "@/app/utils/services/node.mailer";
import moment from "moment";

const createUserSchema = z
  .object({
    userId: z.string(),
  })
  .strict();

function validateSchema({ data }: { data: any }) {
  try {
    const parseData = createUserSchema.parse(data);
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

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();

    const resultValid = validateSchema({
      data: json,
    });

    const result = await deleteUser({ userId: resultValid.userId });

    return NextResponse.json(
      {
        result: "OK",
        message: `User ${result.email} has been successfully deleted.`,
      },
      {
        status: 200,
      }
    );
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
