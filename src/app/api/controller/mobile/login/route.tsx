import { type NextRequest, NextResponse } from "next/server";
import { generateToken, loginUser } from "@/app/utils/db/controllerDB";
import z from "zod";
import _ from "lodash";

const Schema = z
  .object({
    email: z.string().email(),
    password: z.string(),
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

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();

    const resultValid = validateSchema({
      data: json,
    });

    const { user, roles } = await loginUser({ email: resultValid.email });

    if (user) {
      if (!user?.inActive) {
        const excBooth = _.filter(roles, (item: any) =>
          [
            "d4ead12a-564e-4f32-b5bb-84ccd253f904", //Super
            "8f595a1e-cb1f-11ee-b237-38f9d362e2c9", //Delivery
            "503da001-3e56-414b-81c0-4329287ea6c7", //member
            "6467c855-165d-4dc8-88b5-68c54599e930", //owner
          ].includes(item.stringId)
        );

        const isEqualRole = _.intersectionBy(
          excBooth,
          user?.roles as any,
          "stringId"
        );

        const generateTokens = await generateToken({
          userId: user?.userId,
          userPassword: resultValid.password,
          dbPassword: user?.password,
        });

        const tokenData: any = {
          token: generateTokens.token,
          userId: user.userId,
          fullname: user.fullname,
          phone: user.phone,
          email: user.email,
          createdAt: user.createdAt,
          previlege: isEqualRole,
          roles: excBooth,
        };

        return NextResponse.json(
          {
            userData: tokenData,
          },
          {
            status: 200,
          }
        );
      } else {
        throw new Error("Unfortunately, your account is no longer active.");
      }
    } else {
      throw new Error(
        "Unable to find the user. Please check if the user exists and try again."
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
