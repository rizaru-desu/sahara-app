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
import ImageViewer from "awesome-image-viewer";
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

  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);

  const [listRedeem, setListRedeem] = React.useState<any[]>([]);

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
        const responseApi = await authService.getPageAgentRedeem({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { userDetail, countRedeem, allRedeem } = responseApi.data;
          setLoading(false);

          setListRedeem(allRedeem);
          setTotalPage(Math.ceil(countRedeem / 100));
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

  const getAllRedeem = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getAgentRedeem({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allRedeem, countRedeem } = responseApi.data;
          setLoading(false);
          setListRedeem(allRedeem);
          setTotalPage(Math.ceil(countRedeem / 100));
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

  const searchRedeem = React.useCallback(
    async ({ value }: { value: string }) => {
      try {
        setLoading(true);

        const authService = new Services();
        const responseApi = await authService.searchAgentRedeem({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setListRedeem(data);
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

  const claimRedeemCode = React.useCallback(
    async ({ agentId, redeemId }: { redeemId: string; agentId: string }) => {
      try {
        setLoading(true);

        const authService = new Services();
        const responseApi = await authService.claimRedeemAgent({
          agentId,
          redeemId,
          createdBy: detailUsers?.fullname,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          getPageData({ take: 100, skip: 0 });
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
    [detailUsers?.fullname, logoutUser]
  );

  React.useEffect(() => {
    getPageData({ take: 100, skip: 0 });
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
              <Search
                onSearch={({ value }) => {
                  searchRedeem({ value });
                }}
              />

              <div className="w-auto h-[700px]">
                <DataGrid
                  pagination={true}
                  getRowHeight={() => "auto"}
                  getRowId={(row) => row.reedemId}
                  rows={listRedeem}
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
                              disabled={
                                params.row.status === "Agent Approvement"
                                  ? true
                                  : false
                              }
                              className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:bg-slate-400"
                              onClick={(e: any) => {
                                e.preventDefault();
                                claimRedeemCode({
                                  agentId: params.row.agentId,
                                  redeemId: params.id.toString(),
                                });
                              }}
                            >
                              Accept
                            </button>
                          </div>
                        );
                      },
                    },
                    {
                      field: "status",
                      headerName: "Status",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                      renderCell: (params) => {
                        const status = [
                          {
                            text: "User Claim",
                            color: "bg-blue-500",
                          },
                          {
                            text: "Agent Approvement",
                            color: "bg-green-500",
                          },
                        ] as any;

                        const getStatusInfo = _.find(status, {
                          text: params.value,
                        });

                        return (
                          <span
                            className={`justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm ${getStatusInfo.color}`}
                          >
                            {params.value}
                          </span>
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
                      field: "packageName",
                      headerName: "Package Name",
                      minWidth: 250,
                      align: "left",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "redemCode",
                      headerName: "Redeem Code",
                      minWidth: 250,
                      align: "left",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "fullname",
                      headerName: "Fullname",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "email",
                      headerName: "email",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "phone",
                      headerName: "phone",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
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
                    getAllRedeem({
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
