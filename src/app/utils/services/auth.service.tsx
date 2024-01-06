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

    return response; // Assuming the API response has a property 'result'
  };

  logout = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/logout/"
    );

    return response; // Assuming the API response has a property 'result'
  };

  userDetail = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-user/",
      {}
    );

    return response; // Assuming the API response has a property 'result'
  };

  getAllUser = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-all-user/",
      { skip, take }
    );

    return response; // Assuming the API response has a property 'result'
  };

  saveRolebyUserId = async ({
    fullname,
    userId,
    roles,
  }: {
    fullname: string;
    userId: string;
    roles: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/update-roles/",
      { fullname, userId, roles }
    );

    return response; // Assuming the API response has a property 'result'
  };

  searchUser = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-user-search/",
      { value }
    );

    return response; // Assuming the API response has a property 'result'
  };
}
