import axios, { AxiosInstance, AxiosResponse } from "axios";

export class ProductService {
  protected readonly instance: AxiosInstance;
  public constructor() {
    this.instance = axios.create({
      baseURL: location.origin,
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

  getAllProductLabel = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-all-product-no-pagination/"
    );

    return response;
  };

  searchProduct = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-product-search/",
      { value }
    );

    return response;
  };

  findProduct = async ({ productId }: { productId: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/find-product/",
      { productId }
    );

    return response;
  };

  updateProduct = async ({
    productId,
    modifiedBy,
    productName,
  }: {
    productId: string;
    modifiedBy?: string;
    productName: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/update-product/",
      { productId, modifiedBy, productName }
    );

    return response;
  };
}
