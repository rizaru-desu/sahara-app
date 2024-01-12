import axios, { AxiosInstance, AxiosResponse } from "axios";

export class ProductService {
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

  uploadProduct = async ({ formData }: { formData: any }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/batch-product/",
      formData
    );

    return response;
  };

  addProduct = async ({
    productName,
    productCode,
    price,
    weight,
    unit,
    expiredPeriod,
    createBy,
  }: {
    productName: string;
    productCode: string;
    price: number;
    weight: number;
    unit: string;
    expiredPeriod: number;
    createBy?: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/add-product/",
      { productName, productCode, price, weight, unit, expiredPeriod, createBy }
    );

    return response;
  };

  getAllProduct = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-all-product/",
      { skip, take }
    );

    return response;
  };
}
