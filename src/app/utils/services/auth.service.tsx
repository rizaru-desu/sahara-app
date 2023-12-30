import axios, { AxiosInstance, AxiosResponse } from "axios";

const dev = false;
export class AuthService {
  protected readonly instance: AxiosInstance;
  public constructor() {
    this.instance = axios.create({
      baseURL: dev ? "http://localhost:3000/" : "http://sahara-app.vercel.app/",
      timeout: 30000,
      timeoutErrorMessage: "Time out!",
    });
  }

  login = async ({ email, password }: { email: string; password: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/login/",
      {
        email,
        password,
      }
    );

    return response; // Assuming the API response has a property 'result'
  };
}
