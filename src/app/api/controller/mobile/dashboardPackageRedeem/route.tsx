import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import {
  dashboardPackageRedeem,
  dashboardmyRedeem,
} from "@/app/utils/db/controllerDB";

import _ from "lodash";

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

    if (tokenValidated) {
      const { userId } = tokenValidated;

      const { getPackage, findPoint, getRedeem } = await dashboardPackageRedeem(
        {
          userId,
        }
      );

      const {
        getRedeem: myRedeem,
        statusMap,
        manyAgent,
      } = await dashboardmyRedeem({
        userId,
      });

      const transformedMyRedeem = myRedeem.map((redeem) => {
        if (manyAgent.some((agent) => agent.agentId === redeem.agentId)) {
          const matchingAgent = manyAgent.find(
            (agent) => agent.agentId === redeem.agentId
          );
          return { ...redeem, agentName: matchingAgent?.customerName };
        }
        return redeem;
      });

      const mappedData = _.map(transformedMyRedeem, (d) => {
        const statusValue = _.find(statusMap as any, { key: d.status }).value;
        return { ...d, status: statusValue };
      });

      const finalData = _.map(getPackage, (packageItem) => {
        const userLimit =
          getRedeem.filter(
            (redeemItem) => redeemItem.packageId === packageItem.packageId
          ).length === packageItem.limit;

        const active =
          findPoint &&
          findPoint.loyaltyPoint &&
          findPoint.loyaltyPoint >= packageItem.point;

        return {
          packageId: packageItem.packageId,
          packageName: packageItem.packageName,
          packageDesc: packageItem.packageDesc,
          photo: `${baseURL}/api/controller/packageRedeem/image/${packageItem.packageId}`,
          point: packageItem.point,
          currentLimit: getRedeem.filter(
            (redeemItem) => redeemItem.packageId === packageItem.packageId
          ).length,
          limit: packageItem.limit,
          userLimit,
          active,
        };
      });

      return NextResponse.json(
        {
          packageReedem: finalData,
          myRedeem: mappedData,
          listAgent: manyAgent,
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
