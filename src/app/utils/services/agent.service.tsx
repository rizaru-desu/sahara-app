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

  addAgent = async ({
    namaUsaha,
    namaMerek,
    lamaUsaha,
    totalBooth,
    instagram,
    facebook,
    ecommerce,
    createBy,
  }: {
    namaUsaha: string;
    namaMerek: string;
    lamaUsaha: number;
    totalBooth: number;
    instagram?: string;
    facebook?: string;
    ecommerce?: string;
    createBy?: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/add-agent/",
      {
        namaUsaha,
        namaMerek,
        lamaUsaha: Number(lamaUsaha),
        totalBooth: Number(totalBooth),
        instagram,
        facebook,
        ecommerce,
        createBy,
      }
    );

    return response;
  };

  getAgent = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-all-agent/",
      { skip, take }
    );

    return response;
  };

  searchAgent = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-agent-search/",
      { value }
    );

    return response;
  };

  addBooth = async ({ data }: { data: any }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/add-booth/",
      data
    );
    return response;
  };

  getBooth = async ({
    skip,
    take,
    agentId,
  }: {
    skip: number;
    take: number;
    agentId: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/get-all-booth/",
      { skip, take, agentId }
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
