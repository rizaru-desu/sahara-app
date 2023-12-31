import axios, { AxiosInstance, AxiosResponse } from "axios";

export class AuthService {
  protected readonly instance: AxiosInstance;
  public constructor() {
    const baseURL =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : "https://sahara-app.vercel.app/";

    this.instance = axios.create({
      baseURL: baseURL,
      timeout: 30000,
      timeoutErrorMessage: "Time out!",
    });
  }

  login = async ({ email, password }: { email: string; password: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/login-apps/",
      {
        email,
        password,
      }
    );

    return response;
  };

  logout = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/logout/"
    );

    return response;
  };

  userDetail = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-user/",
      {}
    );

    return response;
  };

  getAllUser = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-all-user/",
      { skip, take }
    );

    return response;
  };

  addUser = async ({
    email,
    fullname,
    phone,
    bod,
    roles,
    createBy,
  }: {
    email: string;
    fullname: string;
    phone: string;
    bod: string;
    roles: string;
    createBy?: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/add-user/",
      { email, fullname, phone, bod, roles, createBy }
    );

    return response;
  };

  deleteUser = async ({ userId }: { userId: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/delete-user/",
      { userId }
    );

    return response;
  };

  updateUserRoles = async ({
    modifiedBy,
    userId,
    roles,
  }: {
    modifiedBy?: string;
    userId: string;
    roles: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/update-roles/",
      { modifiedBy, userId, roles }
    );

    return response;
  };

  searchUser = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-user-search/",
      { value }
    );

    return response;
  };
}
