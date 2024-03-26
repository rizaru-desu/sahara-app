/* eslint-disable @next/next/no-img-element */
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
import styled from "@emotion/styled";

export default function Home() {
  const router = useRouter();
  const outerTheme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);

  const [listPackage, setListPackage] = React.useState<any[]>([]);

  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const [selectFile, setSelectFile] = React.useState<File | null>(null);
  const [packageId, setSetPackageId] = React.useState<string>("");

  const [packageInput, setPackageInput] = React.useState<{
    packageName: string;
    packageDesc: string;
    point: any;
    limit: any;
  }>({
    packageName: "",
    packageDesc: "",
    point: 0,
    limit: 0,
  });

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
        const responseApi = await authService.getPagePackageRedem({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { userDetail, countPackage, allPackage } = responseApi.data;
          setLoading(false);

          setListPackage(allPackage);
          setTotalPage(Math.ceil(countPackage / 100));
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

  const getAllPackage = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getPackageRedem({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allPackage, countPackage } = responseApi.data;
          setLoading(false);
          setListPackage(allPackage);
          setTotalPage(Math.ceil(countPackage / 100));
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

  const searchPackage = React.useCallback(
    async ({ value }: { value: string }) => {
      try {
        setLoading(true);

        const authService = new Services();
        const responseApi = await authService.searchPackage({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setListPackage(data);
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

  const addPackage = React.useCallback(
    async ({ formData }: { formData: any }) => {
      try {
        setLoading(true);

        const authService = new Services();
        const responseApi = await authService.addPackageRedeem({
          formData,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          getAllPackage({ skip: 0, take: 100 });
          setSelectFile(null);
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
    [getAllPackage, logoutUser]
  );

  const editPackages = React.useCallback(
    async ({ formData }: { formData: any }) => {
      try {
        setLoading(true);

        const authService = new Services();
        const responseApi = await authService.editPackageRedeem({
          formData,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          getAllPackage({ skip: 0, take: 100 });
          setSelectFile(null);
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
    [getAllPackage, logoutUser]
  );

  const activePackage = React.useCallback(
    async ({ packageId, value }: { packageId: string; value: boolean }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.activePackage({
          packageId,
          value,
          createdBy: detailUsers?.fullname,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({ message, type: "success" });
          getAllPackage({ skip: 0, take: 100 });
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
    [detailUsers?.fullname, getAllPackage, logoutUser]
  );

  React.useEffect(() => {
    getPageData({ take: 100, skip: 0 });
  }, [getPageData]);

  const handlePackageInput = (e: any) => {
    const { name, value } = e.target;

    setPackageInput((prevData: any) => ({
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
            <div className="m-10 flex flex-col">
              <form
                className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col"
                onSubmit={(e: any) => {
                  e.preventDefault();

                  const formData = new FormData();

                  formData.append("packageName", packageInput.packageName);
                  formData.append("point", packageInput.point);
                  formData.append("packageDesc", packageInput.packageDesc);
                  formData.append("photo", selectFile ?? "");
                  formData.append("createdBy", detailUsers?.fullname);
                  formData.append("limit", packageInput.limit);

                  addPackage({ formData });
                }}
              >
                <h6 className="text-black font-bold">Add Package Redeem</h6>

                <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
                  <TextField
                    name="packageName"
                    id="packageName"
                    label="Package Name"
                    type={"text"}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    onChange={handlePackageInput}
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
                    onChange={handlePackageInput}
                  />

                  <TextField
                    name="packageDesc"
                    id="packageDesc"
                    label="Descripton"
                    inputProps={{ max: 255 }}
                    maxRows={4}
                    type={"text"}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    onChange={handlePackageInput}
                  />

                  <TextField
                    name="limit"
                    id="limit"
                    label="Limit"
                    type={"number"}
                    size="small"
                    inputProps={{ min: 0 }}
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    onChange={handlePackageInput}
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
                              if (img.width === 1000 && img.height === 500) {
                                setSelectFile(selectedFile);
                              } else {
                                alert(
                                  "Please select an image with dimensions 1080x1350."
                                );
                                e.target.value = "";
                                setSelectFile(null);
                              }
                            };
                            img.src = event.target!.result as string;
                          };
                          reader.readAsDataURL(selectedFile);
                        } else {
                          alert(
                            "Please select an image with size less than or equal to 500kb."
                          );
                          e.target.value = "";
                          setSelectFile(null);
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
                  searchPackage({ value });
                }}
              />

              <div className="w-auto h-[700px]">
                <DataGrid
                  pagination={true}
                  getRowHeight={() => "auto"}
                  getRowId={(row) => row.packageId}
                  rows={listPackage}
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
                                const findPackage = _.find(listPackage, {
                                  packageId: params.id,
                                });
                                setSetPackageId(params.id.toString());
                                setPackageInput(findPackage);
                                setEditOpen(true);
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
                              activePackage({
                                packageId: params.id.toString(),
                                value: event.target.checked,
                              });
                            }}
                            inputProps={{ "aria-label": "controlled" }}
                          />
                        );
                      },
                    },
                    {
                      field: "packageName",
                      headerName: "Package Name",
                      minWidth: 250,
                      align: "left",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "packageDesc",
                      headerName: "Package Desc",
                      minWidth: 250,
                      align: "left",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "point",
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
                      align: "center",
                      headerAlign: "center",
                      minWidth: 250,
                      editable: false,
                    },
                    {
                      field: "createdAt",
                      headerName: "Created At",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 250,
                      editable: false,
                      valueFormatter: (params: any) =>
                        moment(params?.value).format("DD/MM/YYYY hh:mm"),
                    },
                    {
                      field: "modifiedBy",
                      headerName: "Modified By",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 250,
                      editable: false,
                    },
                    {
                      field: "modifedAt",
                      headerName: "Modifed At",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 250,
                      editable: false,
                      valueFormatter: (params: any) =>
                        moment(params?.value).format("DD/MM/YYYY hh:mm"),
                    },
                  ]}
                />
              </div>

              <div className="flex justify-center py-4">
                <Pagination
                  count={totalPage}
                  page={currentPage}
                  onChange={async (
                    event: React.ChangeEvent<unknown>,
                    value: number
                  ) => {
                    setCurrentPage(value);
                    getAllPackage({
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

                const formData = new FormData();

                formData.append("packageId", packageId);
                formData.append("packageName", packageInput.packageName);
                formData.append("point", packageInput.point);
                formData.append("packageDesc", packageInput.packageDesc);
                formData.append("photo", selectFile ?? "");
                formData.append("createdBy", detailUsers?.fullname);
                formData.append("limit", packageInput.limit);

                editPackages({ formData });

                setEditOpen(false);
              },
            }}
          >
            <DialogContent className="bg-white w-full justify-center items-center gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
              <div className="flex flex-col gap-5">
                <h6 className="text-black text-bold text-lg text-center">
                  <strong>Edit Package Redeem</strong>
                </h6>

                <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
                  <TextField
                    name="packageName"
                    id="packageName"
                    label="Package Name"
                    type={"text"}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    onChange={handlePackageInput}
                    value={packageInput.packageName}
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
                    onChange={handlePackageInput}
                    value={packageInput.point}
                  />

                  <TextField
                    name="packageDesc"
                    id="packageDesc"
                    label="Descripton"
                    inputProps={{ max: 255 }}
                    maxRows={4}
                    type={"text"}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    onChange={handlePackageInput}
                    value={packageInput.packageDesc}
                  />

                  <TextField
                    name="limit"
                    id="limit"
                    label="Limit"
                    type={"number"}
                    size="small"
                    inputProps={{ min: 0 }}
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    onChange={handlePackageInput}
                    value={packageInput.limit}
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
                              if (img.width === 1000 && img.height === 500) {
                                setSelectFile(selectedFile);
                              } else {
                                alert(
                                  "Please select an image with dimensions 1080x1350."
                                );
                                e.target.value = "";
                                setSelectFile(null);
                              }
                            };
                            img.src = event.target!.result as string;
                          };
                          reader.readAsDataURL(selectedFile);
                        } else {
                          alert(
                            "Please select an image with size less than or equal to 500kb."
                          );
                          e.target.value = "";
                          setSelectFile(null);
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
