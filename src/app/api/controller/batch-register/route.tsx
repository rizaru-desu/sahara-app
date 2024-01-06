import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import bcrypt from "bcrypt";
import { batchCreateUser } from "@/app/utils/db/userDB";
import _ from "lodash";

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

    const rowsWithNullEmptyValues = json
      .map((user: any, index: number) => {
        const nullEmptyKeys = Object.keys(user).filter(
          (key) => _.isNil(user[key]) || _.isEmpty(user[key])
        );

        return {
          row: index + 1,
          nullEmptyKeys: nullEmptyKeys,
          hasNullEmptyValues: nullEmptyKeys.length > 0,
        };
      })
      .filter(
        ({ hasNullEmptyValues }: { hasNullEmptyValues: any }) =>
          hasNullEmptyValues
      );

    if (_.isEmpty(rowsWithNullEmptyValues)) {
      const hashPasswords = async () => {
        const hashedPasswords = await Promise.all(
          json.map(async (obj: any) => {
            const hashedPassword = await bcrypt.hash(obj.password, 10);
            return { ...obj, password: hashedPassword };
          })
        );

        return hashedPasswords;
      };

      const hashedPasswords: any = await hashPasswords();

      const manyCreate = await batchCreateUser({
        dataUser: hashedPasswords,
      });

      return NextResponse.json(
        {
          result: "OK",
          message: `A successful creation by ${manyCreate.count} users.`,
        },
        {
          status: 200,
        }
      );
    } else {
      const errorMessageTemplate = "Error Row: {row}, Empty: {nullEmptyKeys}";

      const errorMessages = rowsWithNullEmptyValues
        .filter((item: any) => item.hasNullEmptyValues)
        .map((item: any) => {
          const replacedMessage = errorMessageTemplate
            .replace("{row}", item.row)
            .replace("{nullEmptyKeys}", item.nullEmptyKeys.join(", "));
          return replacedMessage;
        })
        .join(",\n");

      throw new Error(errorMessages);
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
