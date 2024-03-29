/* eslint-disable @next/next/no-img-element */
"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import { Pagination } from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { customTheme } from "@/app/component/theme";
import { DataGrid } from "@mui/x-data-grid";
import _ from "lodash";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import Loader from "@/app/component/loader";
import Loading from "@/app/loading";
import Search from "@/app/component/search";
import moment from "moment";
import ImageViewer from "awesome-image-viewer";
import * as XLSX from "xlsx";

export default function Home({ params }: { params: { id: string } }) {
  const router = useRouter();
  const outerTheme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);
  const [listBoothMember, setlistBoothMember] = React.useState<any[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

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
        const responseApi = await authService.getPageBoothMemberData({
          skip,
          take,
          boothOwnerId: params.id,
        });

        if (responseApi.status === 200) {
          const { allBoothMember, countBoothMember, userDetail } =
            responseApi.data;
          setLoading(false);
          setlistBoothMember(allBoothMember);
          setTotalPage(Math.ceil(countBoothMember / 100));
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
    [logoutUser, params.id]
  );

  const searchBoothMember = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.searchBoothMember({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setlistBoothMember(data);
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

  const getAllBoothMember = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getBoothMember({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allBoothMember, countBoothMember } = responseApi.data;
          setLoading(false);
          setlistBoothMember(allBoothMember);
          setTotalPage(Math.ceil(countBoothMember / 100));
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

  const exportBoothMember = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new Services();
      const responseApi = await authService.exportBoothMember();

      if (responseApi.status === 200) {
        setLoading(false);

        const ws = XLSX.utils.json_to_sheet(responseApi.data.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(
          wb,
          `Booth Member ${moment().format("DD-MM-YYYY")}-${
            Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
          }.xlsx`
        );
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
  }, [logoutUser]);

  React.useEffect(() => {
    getPageData({ skip: 0, take: 100 });
  }, [getPageData]);

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
              <div className="flex flex-row justify-between  my-3">
                <Search
                  onSearch={({ value }) => {
                    searchBoothMember({ value });
                  }}
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    exportBoothMember();
                  }}
                  className="flex justify-center self-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                >
                  Export
                </button>
              </div>

              <div className="w-auto h-[700px]">
                <DataGrid
                  pagination={true}
                  getRowHeight={() => "auto"}
                  rowSelection={false}
                  rows={listBoothMember}
                  columns={[
                    {
                      field: "fullname",
                      headerName: "Member Name",
                      minWidth: 350,
                      flex: 1,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "alamatBooth",
                      headerName: "Alamat Member",
                      hideSortIcons: true,
                      disableColumnMenu: true,
                      minWidth: 350,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                    },

                    {
                      field: "email",
                      headerName: "Email",
                      minWidth: 350,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "phone",
                      headerName: "No. Hp",
                      minWidth: 350,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "photoBooth",
                      headerName: "Photo Booth",
                      minWidth: 350,
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
                              alt="PhotoBooth"
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
                      minWidth: 350,
                      editable: false,
                    },
                    {
                      field: "createdAt",
                      headerName: "Created At",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 350,
                      editable: false,
                      valueFormatter: (params: any) =>
                        moment(params?.value).format("DD/MM/YYYY hh:mm"),
                    },
                    {
                      field: "modifiedBy",
                      headerName: "Modified By",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 350,
                      editable: false,
                    },
                    {
                      field: "modifedAt",
                      headerName: "Modifed At",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 350,
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
                    getAllBoothMember({
                      skip: Math.max(0, (value - 1) * 100),
                      take: 100,
                    });
                  }}
                  shape="rounded"
                />
              </div>
            </div>
          </div>
        </Suspense>

        <Loader active={loading} />
      </main>
    </ThemeProvider>
  );
}
