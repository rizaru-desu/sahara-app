import axios, { AxiosInstance, AxiosResponse } from "axios";

export class CustomerService {
  protected readonly instance: AxiosInstance;
  public constructor() {
    this.instance = axios.create({
      baseURL: location.origin,
      timeout: 30000,
      timeoutErrorMessage: "Time out!",
    });
  }

  getCustomer = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-all-customer/",
      { skip, take }
    );

    return response;
  };

  searchCustomer = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-customer-search/",
      { value }
    );

    return response;
  };

  getBooth = async ({
    skip,
    take,
    customerId,
  }: {
    skip: number;
    take: number;
    customerId: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-all-booth/",
      { skip, take, customerId }
    );

    return response;
  };

  searchBooth = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-booth-search/",
      { value }
    );

    return response;
  };
}
