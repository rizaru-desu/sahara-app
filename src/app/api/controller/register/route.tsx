import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import bcrypt from "bcrypt";
import { createUser, findByEmail } from "@/app/utils/db/userDB";

//region validation input schema
const createUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
    fullname: z.string(),
    phone: z.string().refine(
      (value) => {
        // Add your phone number validation logic here
        // For example, you can check the length or use a regular expression
        // This is a basic example, and you may need to adjust it based on your requirements
        return /^\+62\d{9,}$/.test(value);
      },
      { message: "Invalid phone number format" }
    ),
    dateOfBirth: z.string(),
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
//endregion

//region post add user
export async function POST(request: NextRequest) {
  try {
    //get the details provided by user
    const json = await request.json();
    //understand whether the details are correct as expect.
    const resultValid = validateSchema({
      data: json,
    });

    const user = (await findByEmail({ email: resultValid.email })) as any;

    const hashedPassword = await bcrypt.hash(resultValid.password, 10);

    if (!user) {
      await createUser({
        dataUser: {
          userId: uuidv4().toUpperCase(),
          email: resultValid.email,
          password: hashedPassword,
          fullname: resultValid.fullname,
          dateOfBirth: resultValid.dateOfBirth,
          phone: resultValid.phone,
          roleId: "37254D02-3CDC-4469-8B9E-2FD241FBB868",
        },
      });

      return NextResponse.json(
        {
          result: "OK",
          message: `User ${resultValid.email} has been successfully created.`,
        },
        {
          status: 200, // You can replace 500 with the desired status code
        }
      );
    } else {
      throw new Error(
        "This email address is already in use. Please choose a different one."
      );
    }
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
