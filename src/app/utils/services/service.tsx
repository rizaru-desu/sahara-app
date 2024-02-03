import axios, { AxiosInstance, AxiosResponse } from "axios";

export class Services {
  protected readonly instance: AxiosInstance;
  public constructor() {
    this.instance = axios.create({
      baseURL: location.origin,
      timeout: 30000,
      timeoutErrorMessage: "Time out!",
    });
  }

  /** USER */
  loginUser = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/user/login",
      {
        email,
        password,
      }
    );

    return response;
  };

  logoutUser = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/user/logout/"
    );

    return response;
  };

  detailUser = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/user/detail/",
      {}
    );

    return response;
  };

  roleAllUser = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/user/roles/",
      {}
    );

    return response;
  };

  getUser = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/user/all-user",
      { skip, take }
    );

    return response;
  };

  getPageUserData = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/user/",
      { skip, take }
    );

    return response;
  };

  addUser = async ({
    email,
    fullname,
    bod,
    phone,
    createdBy,
    leader,
  }: {
    email: string;
    fullname: string;
    bod: string;
    phone: string;
    createdBy: string;
    leader?: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/user/add",
      { email, fullname, bod, phone, createdBy, leader }
    );

    return response;
  };

  editUser = async ({
    userId,
    email,
    fullname,
    bod,
    phone,
    modifiedBy,
    leader,
  }: {
    userId: string;
    email: string;
    fullname: string;
    bod: string;
    phone: string;
    modifiedBy: string;
    leader?: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/user/update-data",
      { userId, email, fullname, bod, phone, modifiedBy, leader }
    );

    return response;
  };

  activeUser = async ({
    userId,
    value,
    modifiedBy,
  }: {
    userId: string;
    value: boolean;
    modifiedBy: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/user/update-active",
      { userId, value, modifiedBy }
    );

    return response;
  };

  searchUser = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/user/search",
      { value }
    );

    return response;
  };

  addRoles = async ({
    userId,
    stringId,
    createdBy,
  }: {
    userId: string;
    stringId: string;
    createdBy: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/user/add-roles",
      { userId, stringId, createdBy }
    );

    return response;
  };

  deleteRoles = async ({ userId, roles }: { userId: string; roles: any[] }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/user/delete-roles",
      { userId, roles }
    );

    return response;
  };
  //** END SECTION USER */

  //** SECTION AGENT */
  getPageAgentData = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/agent/",
      { skip, take }
    );

    return response;
  };

  searchAgent = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/agent/search",
      { value }
    );

    return response;
  };

  getAgent = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/agent/all-agent",
      { skip, take }
    );

    return response;
  };

  addAgent = async ({
    email,
    customerName,
    picName,
    picPhone,
    alamatToko,
    noNpwp,
    createdBy,
  }: AgentInput) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/agent/add",
      { email, customerName, picName, picPhone, alamatToko, noNpwp, createdBy }
    );

    return response;
  };

  editAgent = async ({
    agentId,
    email,
    customerName,
    picName,
    picPhone,
    alamatToko,
    noNpwp,
    modifiedBy,
  }: AgentInput) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/agent/update-data",
      {
        agentId,
        email,
        customerName,
        picName,
        picPhone,
        alamatToko,
        noNpwp,
        modifiedBy,
      }
    );

    return response;
  };

  exportAgent = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/agent/export/",
      {}
    );

    return response;
  };
  //** END SECTION AGENT */

  //** SECTION PRODUCT */
  getPageProductData = async ({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/product/",
      { skip, take }
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
    createdBy,
  }: addProducts) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/product/add",
      {
        productName,
        productCode,
        price,
        weight,
        unit,
        expiredPeriod,
        createdBy,
      }
    );

    return response;
  };

  getProduct = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/product/all-product",
      { skip, take }
    );

    return response;
  };

  searchProduct = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/product/search",
      { value }
    );

    return response;
  };

  uploadProduct = async ({ formData }: { formData: any }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/product/batch",
      formData
    );

    return response;
  };

  exportProduct = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/product/export/",
      {}
    );

    return response;
  };
  //** END SECTION PRODUCT */

  //** SECTION BOOTH OWNER */
  getPageBoothOwnerData = async ({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/boothOwner/",
      { skip, take }
    );

    return response;
  };

  getPageBoothMemberData = async ({
    skip,
    take,
    boothOwnerId,
  }: {
    skip: number;
    take: number;
    boothOwnerId: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/boothOwner/member/",
      { skip, take, boothOwnerId }
    );

    return response;
  };

  getBoothOwner = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/boothOwner/all-boothOwner",
      { skip, take }
    );

    return response;
  };

  getBoothMember = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/boothOwner/member/all-boothMember/",
      { skip, take }
    );

    return response;
  };

  searchBoothOwner = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/boothOwner/search",
      { value }
    );

    return response;
  };

  searchBoothMember = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/boothOwner/member/search",
      { value }
    );

    return response;
  };

  exportBoothOwner = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/boothOwner/export/",
      {}
    );

    return response;
  };

  exportBoothMember = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/boothOwner/member/export/",
      {}
    );

    return response;
  };
  //** END  SECTION BOOTH OWNER */
}

interface AgentInput {
  agentId?: string;
  email: string;
  customerName: string;
  picPhone: string;
  picName: string;
  alamatToko: string;
  noNpwp?: string;
  createdBy?: string;
  modifiedBy?: string;
}

interface addProducts {
  productName: string;
  productCode: string;
  price: number;
  weight: number;
  unit: string;
  expiredPeriod: number;
  createdBy?: string;
}
