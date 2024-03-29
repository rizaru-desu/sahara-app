import { type NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/utils/token/validate";
import { addUserBooth, claimUserPackage } from "@/app/utils/db/controllerDB";
import z from "zod";
import _ from "lodash";
import sendMailer from "@/app/utils/services/node.mailer";
import moment from "moment";

const Schema = z
  .object({
    agentId: z.string(),
    packageId: z.string(),
    createdBy: z.string(),
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

      const { createRedeem, findAgent } = await claimUserPackage({
        userId: userId,
        packageId: resultValid.packageId,
        createdBy: resultValid.createdBy,
        agentId: resultValid.agentId,
      });

      await sendMailer({
        send: createRedeem?.email || "",
        cc: `${findAgent?.email}, ''`, // juga sahara
        subject: `${createRedeem?.fullname} `,
        html: html({
          fullname: createRedeem?.fullname || "",
          packageName: createRedeem?.packageName || "",
          redemCode: createRedeem?.redemCode || "",
        }),
      });

      return NextResponse.json(
        {
          message: `Successfully claim package, please check your email.`,
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

const html = ({
  fullname,
  packageName,
  redemCode,
}: {
  fullname: string;
  packageName: string;
  redemCode: string;
}) =>
  `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en" > <head> <meta charset="UTF-8" /> <meta content="width=device-width, initial-scale=1" name="viewport" /> <meta name="x-apple-disable-message-reformatting" /> <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <meta content="telephone=no" name="format-detection" /> <style type="text/css"> #outlook a { padding: 0; } .es-button { mso-style-priority: 100 !important; text-decoration: none !important; } a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; } .es-desk-hidden { display: none; float: left; overflow: hidden; width: 0; max-height: 0; line-height: 0; mso-hide: all; } @media only screen and (max-width: 600px) { p, ul li, ol li, a { line-height: 150% !important; } h1, h2, h3, h1 a, h2 a, h3 a { line-height: 120% !important; } h1 { font-size: 30px !important; text-align: left; } h2 { font-size: 24px !important; text-align: left; } h3 { font-size: 20px !important; text-align: left; } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size: 30px !important; text-align: left; } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size: 24px !important; text-align: left; } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size: 20px !important; text-align: left; } .es-menu td a { font-size: 14px !important; } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size: 14px !important; } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size: 14px !important; } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size: 14px !important; } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size: 12px !important; } *[class="gmail-fix"] { display: none !important; } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align: center !important; } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align: right !important; } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align: left !important; } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display: inline !important; } .es-button-border { display: inline-block !important; } a.es-button, button.es-button { font-size: 18px !important; display: inline-block !important; } .es-adaptive table, .es-left, .es-right { width: 100% !important; } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width: 100% !important; max-width: 600px !important; } .es-adapt-td { display: block !important; width: 100% !important; } .adapt-img { width: 100% !important; height: auto !important; } .es-m-p0 { padding: 0 !important; } .es-m-p0r { padding-right: 0 !important; } .es-m-p0l { padding-left: 0 !important; } .es-m-p0t { padding-top: 0 !important; } .es-m-p0b { padding-bottom: 0 !important; } .es-m-p20b { padding-bottom: 20px !important; } .es-mobile-hidden, .es-hidden { display: none !important; } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width: auto !important; overflow: visible !important; float: none !important; max-height: inherit !important; line-height: inherit !important; } tr.es-desk-hidden { display: table-row !important; } table.es-desk-hidden { display: table !important; } td.es-desk-menu-hidden { display: table-cell !important; } .es-menu td { width: 1% !important; } table.es-table-not-adapt, .esd-block-html table { width: auto !important; } table.es-social { display: inline-block !important; } table.es-social td { display: inline-block !important; } .es-desk-hidden { display: table-row !important; width: auto !important; overflow: visible !important; max-height: inherit !important; } .es-m-p5 { padding: 5px !important; } .es-m-p5t { padding-top: 5px !important; } .es-m-p5b { padding-bottom: 5px !important; } .es-m-p5r { padding-right: 5px !important; } .es-m-p5l { padding-left: 5px !important; } .es-m-p10 { padding: 10px !important; } .es-m-p10t { padding-top: 10px !important; } .es-m-p10b { padding-bottom: 10px !important; } .es-m-p10r { padding-right: 10px !important; } .es-m-p10l { padding-left: 10px !important; } .es-m-p15 { padding: 15px !important; } .es-m-p15t { padding-top: 15px !important; } .es-m-p15b { padding-bottom: 15px !important; } .es-m-p15r { padding-right: 15px !important; } .es-m-p15l { padding-left: 15px !important; } .es-m-p20 { padding: 20px !important; } .es-m-p20t { padding-top: 20px !important; } .es-m-p20r { padding-right: 20px !important; } .es-m-p20l { padding-left: 20px !important; } .es-m-p25 { padding: 25px !important; } .es-m-p25t { padding-top: 25px !important; } .es-m-p25b { padding-bottom: 25px !important; } .es-m-p25r { padding-right: 25px !important; } .es-m-p25l { padding-left: 25px !important; } .es-m-p30 { padding: 30px !important; } .es-m-p30t { padding-top: 30px !important; } .es-m-p30b { padding-bottom: 30px !important; } .es-m-p30r { padding-right: 30px !important; } .es-m-p30l { padding-left: 30px !important; } .es-m-p35 { padding: 35px !important; } .es-m-p35t { padding-top: 35px !important; } .es-m-p35b { padding-bottom: 35px !important; } .es-m-p35r { padding-right: 35px !important; } .es-m-p35l { padding-left: 35px !important; } .es-m-p40 { padding: 40px !important; } .es-m-p40t { padding-top: 40px !important; } .es-m-p40b { padding-bottom: 40px !important; } .es-m-p40r { padding-right: 40px !important; } .es-m-p40l { padding-left: 40px !important; } } @media screen and (max-width: 384px) { .mail-message-content { width: 414px !important; } } </style> </head> <body style=" width: 100%; font-family: arial, 'helvetica neue', helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; padding: 0; margin: 0; " > <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color: #f6f6f6" > <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; padding: 0; margin: 0; width: 100%; height: 100%; background-repeat: repeat; background-position: center top; background-color: #f6f6f6; " > <tr> <td valign="top" style="padding: 0; margin: 0"> <table class="es-header" cellspacing="0" cellpadding="0" align="center" role="none" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; table-layout: fixed !important; width: 100%; background-color: transparent; background-repeat: repeat; background-position: center top; " > <tr> <td align="center" style="padding: 0; margin: 0"> <table class="es-header-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" role="none" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; background-color: #ffffff; width: 600px; " > <tr> <td align="left" style=" margin: 0; padding-bottom: 10px; padding-top: 15px; padding-left: 20px; padding-right: 20px; " > <table class="es-left" cellspacing="0" cellpadding="0" align="left" role="none" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; float: left; " > <tr> <td class="es-m-p0r es-m-p20b" align="center" style="padding: 0; margin: 0; width: 174px" > <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; " > <tr> <td class="es-m-p0r es-m-p0t es-m-txt-c" align="left" style=" padding: 0; margin: 0; padding-top: 15px; " > <p style=" margin: 0; -webkit-text-size-adjust: none; -ms-text-size-adjust: none; mso-line-height-rule: exactly; font-family: 'comic sans ms', 'marker felt-thin', arial, sans-serif; line-height: 21px; color: #333333; font-size: 14px;">${moment().format(
    "DD MMMM YYYY"
  )}</p> </td> </tr> </table> </td> <td class="es-hidden" style="padding: 0; margin: 0; width: 20px" ></td> </tr> </table> <table class="es-left" cellspacing="0" cellpadding="0" align="left" role="none" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; float: left; " > <tr> <td class="es-m-p20b" align="center" style="padding: 0; margin: 0; width: 173px" > <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; " > <tr> <td class="es-m-p0l" align="center" style=" padding: 0; margin: 0; font-size: 0px; " > <img  src="https://saharabogatama.co.id/wp-content/uploads/2022/03/logo-sahara-bogatama-mid.png" alt width="200" style=" display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; " height="68" /> </td> </tr> </table> </td> </tr> </table> <table class="es-right" cellspacing="0" cellpadding="0" align="right" role="none" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; float: right; " > <tr> <td align="center" style="padding: 0; margin: 0; width: 173px" > <table width="100%" cellspacing="0" cellpadding="0" role="none" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; " > <tr> <td align="center" style="padding: 0; margin: 0; display: none" ></td> </tr> </table> </td> </tr> </table> </td> </tr> </table> </td> </tr> </table> <table class="es-content" cellspacing="0" cellpadding="0" align="center" role="none" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; table-layout: fixed !important; width: 100%; " > <tr> <td align="center" style="padding: 0; margin: 0"> <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" role="none" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; background-color: #ffffff; width: 600px; " > <tr> <td align="left" style=" padding: 0; margin: 0; padding-top: 20px; padding-left: 20px; padding-right: 20px; " > <table width="100%" cellspacing="0" cellpadding="0" role="none" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; " > <tr> <td valign="top" align="center" style="padding: 0; margin: 0; width: 560px" > <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; " > <tr> <td align="left" style="padding: 0; margin: 0" > <h3 style=" margin: 0; line-height: 24px; mso-line-height-rule: exactly; font-family: 'comic sans ms', 'marker felt-thin', arial, sans-serif; font-size: 20px; font-style: normal; font-weight: normal; color: #333333; " > Hello [${fullname}], </h3> </td> </tr> <tr> <td align="left" style="padding: 0; margin: 0" > <p style=" margin: 0; -webkit-text-size-adjust: none; -ms-text-size-adjust: none; mso-line-height-rule: exactly; font-family: 'comic sans ms', 'marker felt-thin', arial, sans-serif; line-height: 21px; color: #333333; font-size: 14px; " > Congratulations on successfully redeeming the package ${packageName}! </p> </td> </tr> <tr> <td align="center" style="padding: 0; margin: 0" > <p style=" margin: 0; -webkit-text-size-adjust: none; -ms-text-size-adjust: none; mso-line-height-rule: exactly; font-family: 'comic sans ms', 'marker felt-thin', arial, sans-serif; line-height: 45px; color: #333333; font-size: 30px; text-decoration:none " > Claim Code <br> ${redemCode} </p> </td> </tr> <tr> <td align="left" style="padding: 0; margin: 0" > <p style=" margin: 0; -webkit-text-size-adjust: none; -ms-text-size-adjust: none; mso-line-height-rule: exactly; font-family: 'comic sans ms', 'marker felt-thin', arial, sans-serif; line-height: 21px; color: #333333; font-size: 14px; " > Please contact the nearest agent to exchange the claim code. </p> <p style=" margin: 0; -webkit-text-size-adjust: none; -ms-text-size-adjust: none; mso-line-height-rule: exactly; font-family: 'comic sans ms', 'marker felt-thin', arial, sans-serif; line-height: 21px; color: #333333; font-size: 14px; " > Thank you for choosing our service!<br /> </p> <p style=" margin: 0; -webkit-text-size-adjust: none; -ms-text-size-adjust: none; mso-line-height-rule: exactly; font-family: 'comic sans ms', 'marker felt-thin', arial, sans-serif; line-height: 21px; color: #333333; font-size: 14px; " > <br /> </p> <p style=" margin: 0; -webkit-text-size-adjust: none; -ms-text-size-adjust: none; mso-line-height-rule: exactly; font-family: 'comic sans ms', 'marker felt-thin', arial, sans-serif; line-height: 21px; color: #333333; font-size: 14px; " > Best regards,<br /> </p> <p style=" margin: 0; -webkit-text-size-adjust: none; -ms-text-size-adjust: none; mso-line-height-rule: exactly; font-family: 'comic sans ms', 'marker felt-thin', arial, sans-serif; line-height: 21px; color: #333333; font-size: 14px; " > PT.SAHARA BOGATAMA INDONESIA<br /> </p> </td> </tr> </table> </td> </tr> </table> </td> </tr> </table> </td> </tr> </table> <table cellpadding="0" cellspacing="0" class="es-footer" align="center" role="none" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; table-layout: fixed !important; width: 100%; background-color: transparent; background-repeat: repeat; background-position: center top; " > <tr> <td align="center" style="padding: 0; margin: 0"> <table class="es-footer-body" align="center" cellpadding="0" cellspacing="0" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; background-color: #ffffff; width: 600px; " bgcolor="#ffffff" role="none" > <tr> <td align="left" style=" margin: 0; padding-top: 20px; padding-bottom: 20px; padding-left: 20px; padding-right: 20px; " > <table cellpadding="0" cellspacing="0" width="100%" role="none" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; " > <tr> <td align="left" style="padding: 0; margin: 0; width: 560px" > <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style=" mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0px; " > <tr> <td align="center" style=" padding: 0; margin: 0; padding-bottom: 35px; " > <p style=" margin: 0; -webkit-text-size-adjust: none; -ms-text-size-adjust: none; mso-line-height-rule: exactly; font-family: arial, 'helvetica neue', helvetica, sans-serif; line-height: 21px; color: #333333; font-size: 14px; " > ©${new Date().getFullYear()} Inc. All Rights Reserved. </p> <p style=" margin: 0; -webkit-text-size-adjust: none; -ms-text-size-adjust: none; mso-line-height-rule: exactly; font-family: arial, 'helvetica neue', helvetica, sans-serif; line-height: 21px; color: #333333; font-size: 14px; " > Jl. Dr. Ratna Gg. HM. Idrus 1 No.15 A, Jatikramat Jatiasih Bekasi </p> </td> </tr> </table> </td> </tr> </table> </td> </tr> </table> </td> </tr> </table> </td> </tr> </table> </div> </body> </html> `;
