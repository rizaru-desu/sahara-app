import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import { pageDashboard } from "@/app/utils/db/controllerDB";
import _ from "lodash";
import randomColor from "randomcolor";

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

    if (tokenValidated) {
      const baseURL = `${request.nextUrl.origin}`;
      const { userId } = tokenValidated;
      const { detail, activeCampaign, topTenPoint } = await pageDashboard({
        userId: userId,
      });

      const result = _.map(activeCampaign, (item) => {
        return Object.assign(
          {
            photo: `${baseURL}/api/controller/campaign-point/image/${item.campaignId}`,
          },
          _.omit(item, "photo")
        );
      });

      const resultTop = _.map(topTenPoint, (item) => {
        return Object.assign(
          {
            label: item.userIdData?.fullname,
            data: [item.loyaltyPoint],
            backgroundColor: randomColor({
              format: "rgba",
              luminosity: "bright",
            }),
          },
          _.omit(
            item,
            "userIdData",
            "loyaltyPoint",
            "userId",
            "createdAt",
            "modifedAt",
            "modifiedBy",
            "createdBy",
            "pointId"
          )
        );
      });

      return NextResponse.json(
        {
          activeCampaign: result,
          topTenPoint: resultTop,
          userDetail: detail,
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
