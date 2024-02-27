"use strict";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
});

// async..await is not allowed in the global scope, must use a wrapper
export default async function sendMailer({
  send,
  subject,
  html,
}: {
  send: string;
  subject: string;
  html: any;
}) {
  try {
    const info = await transporter.sendMail({
      from: '"no-reply" <no-reply@saharabogatama.co.id>',
      to: send,
      subject: subject,
      html: html, // use the html parameter passed to the function
    });

    return info;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}
