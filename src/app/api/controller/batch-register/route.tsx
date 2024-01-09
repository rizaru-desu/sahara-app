import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { batchCreateUser } from "@/app/utils/db/userDB";
import _ from "lodash";
import { validateToken } from "@/app/utils/token/validate";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization") as any;

    const tokenWithoutBearer = token?.replace(/^Bearer\s+/i, "") || undefined;
    const userData = request.cookies.get("userData");

    const tokenValidated = (await validateToken({
      token: _.isEmpty(tokenWithoutBearer)
        ? userData?.value
        : tokenWithoutBearer,
    })) as any;

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
      if (tokenValidated) {
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
        return NextResponse.json(
          {
            result: "OK",
            message: "Invalid token. Authentication failed.",
          },
          {
            status: 401,
          }
        );
      }
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
