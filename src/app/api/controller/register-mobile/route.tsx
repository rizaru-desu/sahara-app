import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import bcrypt from "bcrypt";
import { createUser, findByEmail } from "@/app/utils/db/userDB";

const createUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
    fullname: z.string(),
    phone: z.string().refine(
      (value) => {
        return /^\+62\d{9,}$/.test(value);
      },
      { message: "Invalid phone number format" }
    ),
    dateOfBirth: z.string(),
    createBy: z.string().optional(),
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

    const user = (await findByEmail({ email: resultValid.email })) as any;

    const hashedPassword = await bcrypt.hash(resultValid.password, 10);

    if (!user) {
      await createUser({
        dataUser: {
          email: resultValid.email,
          password: hashedPassword,
          fullname: resultValid.fullname,
          dateOfBirth: resultValid.dateOfBirth,
          phone: resultValid.phone,
          roleId: "062208b4-94f8-440f-8599-07aee4121fe0", //User Only
        },
      });

      return NextResponse.json(
        {
          result: "OK",
          message: `User ${resultValid.email} has been successfully created.`,
        },
        {
          status: 200,
        }
      );
    } else {
      throw new Error(
        "This email address is already in use. Please choose a different one."
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
