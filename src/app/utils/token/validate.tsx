import jwt from "jsonwebtoken";
import { env } from "process";

export const validateToken = async ({ token }: { token: any }) => {
  try {
    if (!env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in the environment.");
    }

    const decodedToken = jwt.verify(
      token,
      env.JWT_SECRET,
      function (err: any, decoded: any) {
        if (err) {
          return decoded;
        } else {
          return decoded;
        }
      }
    );

    return decodedToken;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
