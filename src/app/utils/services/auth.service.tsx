import axios, { AxiosInstance, AxiosResponse } from "axios";

export class AuthService {
  protected readonly instance: AxiosInstance;
  public constructor() {
    this.instance = axios.create({
      baseURL: location.origin,
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

  getAllRole = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-all-role/",
      {}
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

  activeUser = async ({
    userId,
    value,
  }: {
    userId: string;
    value: boolean;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/active-user/",
      { userId, value }
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
