import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import { dashboardMemberMob } from "@/app/utils/db/controllerDB";
import z from "zod";
import _ from "lodash";

const Schema = z
  .object({
    isOwner: z.boolean(),
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
    const baseURL = `${request.nextUrl.origin}`;
    const token = request.headers.get("Authorization") as any;

    const tokenWithoutBearer = token?.replace(/^Bearer\s+/i, "") || undefined;
    const userData = request.cookies.get("userData");

    const tokenValidated = (await validateToken({
      token: _.isEmpty(tokenWithoutBearer)
        ? userData?.value
        : tokenWithoutBearer,
    })) as any;

    const json = await request.json();

    const resultValid = validateSchema({
      data: json,
    });

    if (tokenValidated) {
      const { userId } = tokenValidated;

      const { listMember, pointLoyalty, dataOwner, historyPoint, campaign } =
        await dashboardMemberMob({
          userId,
          isOwner: resultValid.isOwner,
        });

      const resultCampaign = _.map(campaign, (item) => {
        return Object.assign(
          {
            photo: `${baseURL}/api/controller/campaign-point/image/${item.campaignId}`,
          },
          _.omit(item, "photo")
        );
      });

      const resultMember = _.map(listMember, (item) => {
        return Object.assign(
          {
            photoBooth: `${baseURL}/api/controller/boothOwner/member/image/${item.boothId}`,
          },
          _.omit(item, "photoBooth")
        );
      });

      return NextResponse.json(
        {
          currentPoint: pointLoyalty || 0,
          historyPoint,
          dataOwner,
          listMember: resultMember,
          campaign: resultCampaign,
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          message: "Invalid token. Authentication failed.",
        },
        {
          status: 401,
        }
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
