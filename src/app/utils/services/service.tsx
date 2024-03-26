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
    phoneAgent,
    createdBy,
  }: AgentInput) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/agent/add",
      {
        email,
        customerName,
        picName,
        picPhone,
        alamatToko,
        noNpwp,
        phoneAgent,
        createdBy,
      }
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
    phoneAgent,
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
        phoneAgent,
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
    weight,
    basePoint,
    unit,
    expiredPeriod,
    createdBy,
  }: {
    productName: string;
    productCode: string;
    weight: number;
    basePoint: number;
    unit: string;
    expiredPeriod: number;
    createdBy?: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/product/add",
      {
        productName,
        productCode,
        weight,
        unit,
        basePoint,
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

  //** SECTION LABELING */
  getPageLabelProductData = async ({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-product/",
      { skip, take }
    );

    return response;
  };

  getLabelProduct = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-product/all-labeling/",
      { skip, take }
    );

    return response;
  };

  addLabelProduct = async ({ data }: { data: any[] }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-product/add",
      {
        data,
      }
    );

    return response;
  };

  searchLabelProduct = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-product/search",
      { value }
    );

    return response;
  };

  printerLabelProduct = async ({
    labelIds,
    modifiedBy,
  }: {
    labelIds: string[];
    modifiedBy?: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-product/printer",
      { labelIds, modifiedBy }
    );

    return response;
  };
  //** END SECTION LABELING */

  //** SECTION LABELING Box */
  getPageLabelBoxData = async ({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-box/",
      { skip, take }
    );

    return response;
  };

  getPageLabelBoxChildData = async ({
    labelBoxId,
    skip,
    take,
  }: {
    labelBoxId: string;
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-box/child",
      { labelBoxId, skip, take }
    );

    return response;
  };

  getLabelingBox = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-box/all-labeling-box/",
      { skip, take }
    );

    return response;
  };

  getLabelingBoxProducts = async ({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-box/all-labeling-product/",
      { skip, take }
    );

    return response;
  };

  getLabelingBoxFind = async ({ labelBoxId }: { labelBoxId: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-box/child/find-box",
      { labelBoxId }
    );

    return response;
  };

  searchLabelBox = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-box/search-box",
      { value }
    );

    return response;
  };

  searchLabelBoxProducts = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-box/search-product",
      { value }
    );

    return response;
  };

  addLabelBox = async ({
    labelIds,
    labelCodeBox,
    leader,

    createdBy,
  }: {
    labelIds: string[];
    labelCodeBox: string;
    leader: string;
    createdBy?: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-box/add",
      {
        labelCodeBox,
        labelIds,
        leader,
        createdBy,
      }
    );

    return response;
  };

  addLabelToBox = async ({
    labelIds,
    labelBoxId,
    createdBy,
  }: {
    labelIds: string[];
    labelBoxId: string;
    createdBy?: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-box/child/add",
      {
        labelBoxId,
        labelIds,

        createdBy,
      }
    );

    return response;
  };

  removeLabelFromBox = async ({
    labelIds,
    createdBy,
  }: {
    labelIds: string[];
    createdBy?: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-box/child/remove",
      {
        labelIds,
        createdBy,
      }
    );

    return response;
  };

  printerLabelBox = async ({
    labelIds,
    modifiedBy,
  }: {
    labelIds: string[];
    modifiedBy?: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/labeling-box/printer",
      { labelIds, modifiedBy }
    );

    return response;
  };

  //** SECTION  STOCK PRODUCT */
  getPageStockProductData = async ({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/stock-product/",
      { skip, take }
    );

    return response;
  };

  getStockProduct = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/stock-product/all-stock/",
      { skip, take }
    );

    return response;
  };

  getAllBox = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/stock-product/all-box/",
      {}
    );

    return response;
  };

  addLocationStock = async ({
    location,
    labelBoxId,
    createdBy,
  }: {
    location: string;
    labelBoxId: string;
    createdBy: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/stock-product/add-location/",
      { location, labelBoxId, createdBy }
    );

    return response;
  };

  searchStockProduct = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/stock-product/search",
      { value }
    );

    return response;
  };

  searchRangeStockProduct = async ({ rangeDate }: { rangeDate: any }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/stock-product/search-range",
      { rangeDate }
    );

    return response;
  };
  //** END SECTION STOCK PRODUCTION*/

  //** SECTION  LOYALTY POINT*/
  getPageLoyaltyPointData = async ({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/loyalty-point/",
      { skip, take }
    );

    return response;
  };

  getPageLoyaltyPointLogData = async ({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/loyalty-point/log",
      { skip, take }
    );

    return response;
  };

  getLoyaltyPoint = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/loyalty-point/all-loyalty",
      { skip, take }
    );

    return response;
  };

  getLoyaltyPointLog = async ({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/loyalty-point/log/all-log",
      { skip, take }
    );

    return response;
  };

  searchLoyalty = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/loyalty-point/search",
      { value }
    );

    return response;
  };

  searchLoyaltyLog = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/loyalty-point/log/search",
      { value }
    );

    return response;
  };

  addPenaltyLoyalty = async ({
    pointId,
    userId,
    point,
    loyaltyPoint,
    remarks,
    createdBy,
  }: {
    pointId: string;
    userId: string;
    point: number;
    loyaltyPoint: string;
    remarks: string;
    createdBy?: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/loyalty-point/penalty",
      { pointId, userId, point, loyaltyPoint, remarks, createdBy }
    );

    return response;
  };
  /** END SECTION  LOYALTY POINT*/

  /**  SECTION  CAMPAIGN POINT*/
  getPageCampaignPointData = async ({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/campaign-point/",
      { skip, take }
    );

    return response;
  };

  getCampaign = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/campaign-point/all-campaign",
      { skip, take }
    );

    return response;
  };

  addCampaign = async ({ formData }: { formData: any }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/campaign-point/add-campaign",
      formData
    );

    return response;
  };

  editCampaign = async ({ formData }: { formData: any }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/campaign-point/edit-campaign",
      formData
    );

    return response;
  };

  searchCampaign = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/campaign-point/search",
      { value }
    );

    return response;
  };

  activeCampaign = async ({
    campaignId,
    value,
    createdBy,
  }: {
    campaignId: string;
    value: boolean;
    createdBy: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/campaign-point/update-active",
      { campaignId, value, createdBy }
    );

    return response;
  };
  /** END SECTION  LOYALTY POINT*/

  /** SECTION  DASHBOARD*/
  getPageDashboardData = async () => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/dashboard/",
      {}
    );

    return response;
  };
  /** END SECTION DASHBOARD*/

  /** SECTION DELIVERY ORDER*/
  getPageDeliveryData = async ({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/delivery-order/",
      { skip, take }
    );

    return response;
  };

  getPageDeliveryProductData = async ({
    skip,
    take,
    suratJalanId,
  }: {
    skip: number;
    take: number;
    suratJalanId: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/delivery-order/product",
      { skip, take, suratJalanId }
    );

    return response;
  };

  getDeliveryOrder = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/delivery-order/all-delivery",
      { skip, take }
    );

    return response;
  };

  getRecaiveProduct = async ({ suratJalanId }: { suratJalanId: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/delivery-order/recaive-product/",
      { suratJalanId }
    );

    return response;
  };

  getDeliveryOrderPdf = async ({
    suratJalanId,
    createdBy,
  }: {
    suratJalanId: string;
    createdBy: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/delivery-order/generate-pdf",
      { suratJalanId, createdBy }
    );

    return response;
  };

  searchDeliveryOrder = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/delivery-order/search",
      { value }
    );

    return response;
  };

  recaiveDeliveryOrder = async ({
    suratJalanId,
    recaiveDate,
    recaiveBy,
    recaiveNote,
    dataQty,
    createdBy,
  }: {
    suratJalanId: string;
    recaiveDate: string;
    recaiveBy: string;
    recaiveNote?: string;
    createdBy: string;
    dataQty: any[];
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/delivery-order/submit-recaive-product",
      { suratJalanId, recaiveDate, recaiveBy, recaiveNote, createdBy, dataQty }
    );

    return response;
  };

  cancelDeliveryOrder = async ({
    suratJalanId,
    createdBy,
  }: {
    suratJalanId: string;
    createdBy: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/delivery-order/cancel-delivery",
      { suratJalanId, createdBy }
    );

    return response;
  };

  /** END SECTION DELIVERY ORDER*/

  /** SECTION PACKAGE REDEM*/
  addPackageRedeem = async ({ formData }: { formData: any }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/packageRedeem/add-package",
      formData
    );

    return response;
  };

  editPackageRedeem = async ({ formData }: { formData: any }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/packageRedeem/edit-package",
      formData
    );

    return response;
  };

  getPagePackageRedem = async ({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/packageRedeem/",
      { skip, take }
    );

    return response;
  };

  getPackageRedem = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/packageRedeem/all-package",
      { skip, take }
    );

    return response;
  };

  searchPackage = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/packageRedeem/search",
      { value }
    );

    return response;
  };

  activePackage = async ({
    packageId,
    value,
    createdBy,
  }: {
    packageId: string;
    value: boolean;
    createdBy: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/packageRedeem/update-active",
      { packageId, value, createdBy }
    );

    return response;
  };
  /** END SECTION PACKAGE REDEM*/

  getPageAgentRedeem = async ({
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/agentRedeem/",
      { skip, take }
    );

    return response;
  };

  getAgentRedeem = async ({ skip, take }: { skip: number; take: number }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/agentRedeem/all-redeem",
      { skip, take }
    );

    return response;
  };

  searchAgentRedeem = async ({ value }: { value: string }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/agentRedeem/search",
      { value }
    );

    return response;
  };

  claimRedeemAgent = async ({
    redeemId,
    agentId,
    createdBy,
  }: {
    redeemId: string;
    agentId: string;
    createdBy: string;
  }) => {
    const response: AxiosResponse<any> = await this.instance.post(
      "api/controller/agentRedeem/claim-redeem",
      { redeemId, agentId, createdBy }
    );

    return response;
  };
}

interface AgentInput {
  agentId?: string;
  email: string;
  customerName: string;
  picPhone: string;
  picName: string;
  alamatToko: string;
  noNpwp?: string;
  phoneAgent?: string;
  createdBy?: string;
  modifiedBy?: string;
}
