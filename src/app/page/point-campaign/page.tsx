"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import {
  Checkbox,
  Pagination,
  TextField,
  Dialog,
  DialogContent,
} from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { customTheme } from "@/app/component/theme";
import { DataGrid } from "@mui/x-data-grid";
import ImageViewer from "awesome-image-viewer";
import Select from "react-dropdown-select";
import _ from "lodash";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import Loader from "@/app/component/loader";
import Loading from "@/app/loading";
import Search from "@/app/component/search";
import moment from "moment";

export default function Home() {
  const router = useRouter();
  const outerTheme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);

  const [listCampaign, setListCampaign] = React.useState<any[]>([]);
  const [listProdut, setListProduct] = React.useState<any[]>([]);
  const [currentPoint, setCurrentPoint] = React.useState<any>(undefined);

  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const [selectFile, setSelectFile] = React.useState<File | null>(null);
  const [selectProduct, setSelectProduct] = React.useState<any>([]);
  const [campaignInput, setCampaignInput] = React.useState<{
    campaignId: string;
    campaignName: string;
    startDate: any;
    endDate: any;
    productId: string[];
    loyaltyPoint: any;
    description: string;
  }>({
    campaignId: "",
    campaignName: "",
    startDate: "",
    endDate: "",
    productId: [],
    loyaltyPoint: 0,
    description: "",
  });

  const [currentProduct, setCurrentProduct] = React.useState<any>([]);
  const [listEditProdut, setListEditProduct] = React.useState<any[]>([]);
  const [selectEditProduct, setSelectEditProduct] = React.useState<any>([]);

  const open = React.useCallback(() => {
    isMenuOpen(!menuOpen);
  }, [menuOpen]);

  const logoutUser = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new Services();
      const responseApi = await authService.logoutUser();

      if (responseApi.status === 200) {
        const { message } = responseApi.data;
        setLoading(false);
        router.replace("/");
        toastMessage({
          message: message,
          type: "success",
        });
      }
    } catch (e: any) {
      setLoading(false);
      if (e.response && e.response.status === 500) {
        toastMessage({
          message: e.response.data.message,
          type: "error",
        });
      } else {
        toastMessage({ message: e.message, type: "error" });
      }
    }
  }, [router]);

  const getPageData = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getPageCampaignPointData({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const {
            basePoint,
            allCampaign,
            totalCampaign,
            allProduct,
            userDetail,
          } = responseApi.data;
          setLoading(false);
          setCurrentPoint(basePoint);
          setListProduct(allProduct);
          setListCampaign(allCampaign);
          setTotalPage(Math.ceil(totalCampaign / 100));
          setDetailUsers(userDetail);
        }
      } catch (e: any) {
        setLoading(false);
        if (e.response && e.response.status === 500) {
          toastMessage({
            message: e.response.data.message,
            type: "error",
          });
        } else if (e.response && e.response.status === 401) {
          logoutUser();
        } else {
          toastMessage({ message: e.message, type: "error" });
        }
      }
    },
    [logoutUser]
  );

  const changeDefaultPoint = React.useCallback(async () => {
    try {
      setLoading(true);

      const authService = new Services();
      const responseApi = await authService.changePointLoyalty({
        baseLoyaltyId: currentPoint.baseLoyaltyId,
        value: Number(currentPoint.basePoint),
        createdBy: detailUsers.fullname,
      });

      if (responseApi.status === 200) {
        const { message } = responseApi.data;
        setLoading(false);
        toastMessage({
          message: message,
          type: "success",
        });
      }
    } catch (e: any) {
      setLoading(false);
      if (e.response && e.response.status === 500) {
        toastMessage({
          message: e.response.data.message,
          type: "error",
        });
      } else if (e.response && e.response.status === 401) {
        logoutUser();
      } else {
        toastMessage({ message: e.message, type: "error" });
      }
    }
  }, [
    currentPoint?.baseLoyaltyId,
    currentPoint?.basePoint,
    detailUsers?.fullname,
    logoutUser,
  ]);

  const getAllCampaign = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getCampaign({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allCampaign, totalCampaign, allProduct } = responseApi.data;
          setLoading(false);
          setListCampaign(allCampaign);
          setTotalPage(Math.ceil(totalCampaign / 100));
          setListProduct(allProduct);
        }
      } catch (e: any) {
        setLoading(false);
        if (e.response && e.response.status === 500) {
          toastMessage({
            message: e.response.data.message,
            type: "error",
          });
        } else if (e.response && e.response.status === 401) {
          logoutUser();
        } else {
          toastMessage({ message: e.message, type: "error" });
        }
      }
    },
    [logoutUser]
  );

  const searchCampaign = React.useCallback(
    async ({ value }: { value: string }) => {
      try {
        setLoading(true);

        const authService = new Services();
        const responseApi = await authService.searchCampaign({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setListCampaign(data);
          setTotalPage(1);
        }
      } catch (e: any) {
        setLoading(false);
        if (e.response && e.response.status === 500) {
          toastMessage({
            message: e.response.data.message,
            type: "error",
          });
        } else if (e.response && e.response.status === 401) {
          logoutUser();
        } else {
          toastMessage({ message: e.message, type: "error" });
        }
      }
    },
    [logoutUser]
  );

  const addCampaing = React.useCallback(
    async ({ formData }: { formData: any }) => {
      try {
        setLoading(true);

        const authService = new Services();
        const responseApi = await authService.addCampaign({
          formData,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          getAllCampaign({ skip: 0, take: 100 });
        }
      } catch (e: any) {
        setLoading(false);
        if (e.response && e.response.status === 500) {
          toastMessage({
            message: e.response.data.message,
            type: "error",
          });
        } else if (e.response && e.response.status === 401) {
          logoutUser();
        } else {
          toastMessage({ message: e.message, type: "error" });
        }
      }
    },
    [getAllCampaign, logoutUser]
  );

  const editCampaing = React.useCallback(
    async ({ formData }: { formData: any }) => {
      try {
        setLoading(true);

        const authService = new Services();
        const responseApi = await authService.editCampaign({
          formData,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          getAllCampaign({ skip: 0, take: 100 });
        }
      } catch (e: any) {
        setLoading(false);
        if (e.response && e.response.status === 500) {
          toastMessage({
            message: e.response.data.message,
            type: "error",
          });
        } else if (e.response && e.response.status === 401) {
          logoutUser();
        } else {
          toastMessage({ message: e.message, type: "error" });
        }
      }
    },
    [getAllCampaign, logoutUser]
  );

  const activeCampaign = React.useCallback(
    async ({ campaignId, value }: { campaignId: string; value: boolean }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.activeCampaign({
          campaignId,
          value,
          createdBy: detailUsers?.fullname,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({ message, type: "success" });
          getAllCampaign({ skip: 0, take: 100 });
        }
      } catch (e: any) {
        setLoading(false);
        if (e.response && e.response.status === 500) {
          toastMessage({
            message: e.response.data.message,
            type: "error",
          });
        } else if (e.response && e.response.status === 401) {
          logoutUser();
        } else {
          toastMessage({ message: e.message, type: "error" });
        }
      }
    },
    [detailUsers?.fullname, getAllCampaign, logoutUser]
  );

  React.useEffect(() => {
    getPageData({ take: 100, skip: 0 });
  }, [getPageData]);

  const handleInputChangeCampaign = (e: any) => {
    const { name, value } = e.target;

    setCampaignInput((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <ThemeProvider theme={customTheme(outerTheme)}>
      <main className="dark:bg-white bg-white min-h-screen">
        <SideBar
          opens={menuOpen}
          closeds={open}
          roles={_.map(detailUsers?.roles, "stringId")}
        />

        <NavBar opens={open} data={detailUsers} />

        <Suspense fallback={<Loading />}>
          <div className="p-4 xl:ml-80 gap-12">
            <form
              className="flex flex-col gap-5 "
              onSubmit={(e: any) => {
                e.preventDefault();
                changeDefaultPoint();
              }}
            >
              <h6 className="text-black font-bold">Default Point</h6>

              <div className="flex flex-row item-center gap-5">
                <TextField
                  name="basePoint"
                  id="basePoint"
                  label="Point"
                  type={"number"}
                  size="small"
                  inputProps={{ min: 0 }}
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  value={currentPoint?.basePoint || 0}
                  onChange={(e) => {
                    const { name, value } = e.target;

                    setCurrentPoint((prevData: any) => ({
                      ...prevData,
                      [name]: value,
                    }));
                  }}
                />

                <button
                  type="submit"
                  className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                >
                  Simpan
                </button>
              </div>
            </form>

            <div className="m-10 flex flex-col">
              <form
                className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col"
                onSubmit={(e: any) => {
                  e.preventDefault();

                  const formData = new FormData();

                  formData.append("campaignName", campaignInput.campaignName);
                  formData.append("startDate", campaignInput.startDate);
                  formData.append("endDate", campaignInput.endDate);
                  formData.append(
                    "productId",
                    _.map(selectProduct, "productId") as any
                  );
                  formData.append("loyaltyPoint", campaignInput.loyaltyPoint);
                  formData.append("description", campaignInput.description);
                  formData.append("photo", selectFile ?? "");
                  formData.append("createdBy", detailUsers?.fullname);

                  addCampaing({ formData });
                }}
              >
                <h6 className="text-black font-bold">Add Campaign</h6>

                <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
                  <TextField
                    name="campaignName"
                    id="campaignName"
                    label="Campaign Name"
                    type={"text"}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    onChange={handleInputChangeCampaign}
                  />

                  <TextField
                    name="startDate"
                    id="startDate"
                    label="Start Date"
                    type={"date"}
                    inputProps={{ min: moment().format("YYYY-MM-DD") }}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    onChange={handleInputChangeCampaign}
                  />

                  <TextField
                    name="endDate"
                    id="endDate"
                    label="End Date"
                    inputProps={{ min: moment().format("YYYY-MM-DD") }}
                    type={"date"}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    onChange={handleInputChangeCampaign}
                  />

                  <Select
                    options={listProdut}
                    valueField="productId"
                    labelField="productName"
                    color="#b91c1c"
                    searchBy="productName"
                    searchable
                    required
                    clearable
                    multi
                    placeholder="Select Product"
                    className="text-black"
                    onChange={(values) => {
                      setSelectProduct(values);
                    }}
                    values={selectProduct}
                  />

                  <TextField
                    name="point"
                    id="point"
                    label="Point"
                    type={"number"}
                    size="small"
                    inputProps={{ min: 0 }}
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    onChange={handleInputChangeCampaign}
                  />

                  <TextField
                    name="description"
                    id="description"
                    label="Descripton"
                    inputProps={{ max: 255 }}
                    maxRows={4}
                    type={"text"}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    onChange={handleInputChangeCampaign}
                  />

                  <TextField
                    name="filePath"
                    id="filePath"
                    label="add Image"
                    type={"file"}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    inputProps={{ accept: ".jpg, .jpeg" }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        if (selectedFile.size <= 500 * 1024) {
                          const reader = new FileReader();
                          reader.onload = function (event) {
                            const img = new Image();
                            img.onload = function () {
                              if (img.width <= 1080 && img.height <= 1350) {
                                setSelectFile(selectedFile);
                              } else {
                                alert(
                                  "Please select an image with dimensions 500x200."
                                );
                                e.target.value = ""; // Clear input value
                                setSelectFile(null); // Reset selected file
                              }
                            };
                            img.src = event.target!.result as string;
                          };
                          reader.readAsDataURL(selectedFile);
                        } else {
                          alert(
                            "Please select an image with size less than or equal to 500kb."
                          );
                          e.target.value = ""; // Clear input value
                          setSelectFile(null); // Reset selected file
                        }
                      }
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                >
                  Simpan
                </button>
              </form>
            </div>

            <div className="m-10 flex flex-col">
              <Search
                onSearch={({ value }) => {
                  searchCampaign({ value });
                }}
              />

              <DataGrid
                pagination={true}
                autoHeight
                getRowHeight={() => "auto"}
                getRowId={(row) => row.campaignId}
                rows={listCampaign}
                disableRowSelectionOnClick
                columns={[
                  {
                    field: "actions",
                    headerName: "Actions",
                    hideSortIcons: true,
                    disableColumnMenu: true,
                    minWidth: 150,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                    renderCell: (params) => {
                      return (
                        <div className="grid grid-cols-1 my-2 place-content-center place-items-center">
                          <button
                            type="button"
                            className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                            onClick={(e: any) => {
                              e.preventDefault();
                              setEditOpen(true);

                              const findCampaign = _.find(listCampaign, {
                                campaignId: params.id,
                              });

                              const joinedArray = _.concat(
                                listProdut,
                                findCampaign.listProduct
                              );

                              setCurrentProduct(findCampaign.listProduct);
                              setListEditProduct(joinedArray);
                              setSelectEditProduct(findCampaign.listProduct);

                              setCampaignInput(findCampaign);
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      );
                    },
                  },
                  {
                    field: "inActive",
                    headerName: "In Active",
                    minWidth: 70,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                    renderCell: (params) => {
                      return (
                        <Checkbox
                          checked={params.value}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            event.stopPropagation();
                            activeCampaign({
                              campaignId: params.id.toString(),
                              value: event.target.checked,
                            });
                          }}
                          inputProps={{ "aria-label": "controlled" }}
                        />
                      );
                    },
                  },
                  {
                    field: "campaignName",
                    headerName: "CampaignName",
                    minWidth: 250,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "startDate",
                    headerName: "Start Date",
                    minWidth: 250,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY"),
                  },
                  {
                    field: "endDate",
                    headerName: "End Date",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY"),
                  },
                  {
                    field: "loyaltyPoint",
                    headerName: "Point",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "photo",
                    headerName: "Image",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                    renderCell: (params) => {
                      const onClick = (e: any) => {
                        e.stopPropagation();

                        new ImageViewer({
                          images: [
                            {
                              mainUrl: params.value,
                            },
                          ],
                          showThumbnails: false,
                          isZoomable: false,
                          stretchImages: false,
                        });
                      };

                      return (
                        <button className="m-4" onClick={onClick}>
                          <img
                            src={params.value}
                            alt="Phoots"
                            className="w-full max-w-[400px] h-auto"
                          />
                        </button>
                      );
                    },
                  },
                  {
                    field: "createdBy",
                    headerName: "Created By",
                    headerAlign: "center",
                    minWidth: 250,
                    editable: false,
                  },
                  {
                    field: "createdAt",
                    headerName: "Created At",
                    headerAlign: "center",
                    minWidth: 250,
                    editable: false,
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY hh:mm"),
                  },
                  {
                    field: "modifiedBy",
                    headerName: "Modified By",
                    headerAlign: "center",
                    minWidth: 250,
                    editable: false,
                  },
                  {
                    field: "modifedAt",
                    headerName: "Modifed At",
                    headerAlign: "center",
                    minWidth: 250,
                    editable: false,
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY hh:mm"),
                  },
                ]}
              />

              <div className="flex justify-center py-4">
                <Pagination
                  count={totalPage}
                  page={currentPage}
                  onChange={async (
                    event: React.ChangeEvent<unknown>,
                    value: number
                  ) => {
                    setCurrentPage(value);
                    getAllCampaign({
                      skip: Math.max(0, (value - 1) * 100),
                      take: 100,
                    });
                  }}
                  shape="rounded"
                />
              </div>
            </div>
          </div>

          <Dialog
            open={editOpen}
            onClose={() => {
              setEditOpen(false);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
              component: "form",
              onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();

                const removeProductId = _.differenceBy(
                  currentProduct,
                  selectEditProduct
                );

                const formData = new FormData();

                formData.append("campaignId", campaignInput.campaignId);
                formData.append("campaignName", campaignInput.campaignName);
                formData.append("startDate", campaignInput.startDate);
                formData.append("endDate", campaignInput.endDate);
                formData.append(
                  "removeProductId",
                  _.map(removeProductId, "productId") as any
                );
                formData.append(
                  "productId",
                  _.map(selectEditProduct, "productId") as any
                );
                formData.append("loyaltyPoint", campaignInput.loyaltyPoint);
                formData.append("description", campaignInput.description);
                formData.append("photo", selectFile ?? "");
                formData.append("createdBy", detailUsers?.fullname);

                editCampaing({ formData });

                setEditOpen(false);
              },
            }}
          >
            <DialogContent className="bg-white w-full justify-center items-center gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
              <div className="flex flex-col gap-5">
                <h6 className="text-black text-bold text-lg text-center">
                  <strong>Edit Campaign</strong>
                </h6>

                <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
                  <TextField
                    name="campaignName"
                    id="campaignName"
                    label="Campaign Name"
                    type={"text"}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    onChange={handleInputChangeCampaign}
                    value={campaignInput.campaignName}
                  />

                  <TextField
                    name="startDate"
                    id="startDate"
                    label="Start Date"
                    type={"date"}
                    inputProps={{ min: moment().format("YYYY-MM-DD") }}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    onChange={handleInputChangeCampaign}
                    value={moment(campaignInput.startDate).format("YYYY-MM-DD")}
                  />

                  <TextField
                    name="endDate"
                    id="endDate"
                    label="End Date"
                    inputProps={{ min: moment().format("YYYY-MM-DD") }}
                    type={"date"}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    onChange={handleInputChangeCampaign}
                    value={moment(campaignInput.endDate).format("YYYY-MM-DD")}
                  />

                  <TextField
                    name="loyaltyPoint"
                    id="loyaltyPoint"
                    label="Point"
                    type={"number"}
                    size="small"
                    inputProps={{ min: 0 }}
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    onChange={handleInputChangeCampaign}
                    value={campaignInput.loyaltyPoint}
                  />

                  <TextField
                    name="description"
                    id="description"
                    label="Descripton"
                    inputProps={{ max: 255 }}
                    maxRows={4}
                    type={"text"}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    onChange={handleInputChangeCampaign}
                    value={campaignInput.description}
                  />

                  <Select
                    options={listEditProdut}
                    valueField="productId"
                    labelField="productName"
                    color="#b91c1c"
                    searchBy="productName"
                    searchable
                    required
                    clearable
                    multi
                    placeholder="Select Product"
                    className="text-black"
                    onChange={(values) => {
                      setSelectEditProduct(values);
                    }}
                    values={selectEditProduct}
                  />

                  <TextField
                    name="filePath"
                    id="filePath"
                    label="add Image"
                    type={"file"}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    inputProps={{ accept: ".jpg, .jpeg" }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        if (selectedFile.size <= 500 * 1024) {
                          const reader = new FileReader();
                          reader.onload = function (event) {
                            const img = new Image();
                            img.onload = function () {
                              if (img.width <= 1080 && img.height <= 1350) {
                                setSelectFile(selectedFile);
                              } else {
                                alert(
                                  "Please select an image with dimensions 500x200."
                                );
                                e.target.value = ""; // Clear input value
                                setSelectFile(null); // Reset selected file
                              }
                            };
                            img.src = event.target!.result as string;
                          };
                          reader.readAsDataURL(selectedFile);
                        } else {
                          alert(
                            "Please select an image with size less than or equal to 500kb."
                          );
                          e.target.value = ""; // Clear input value
                          setSelectFile(null); // Reset selected file
                        }
                      }
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:bg-red-300"
                >
                  Simpan
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </Suspense>

        <Loader active={loading} />
      </main>
    </ThemeProvider>
  );
}
