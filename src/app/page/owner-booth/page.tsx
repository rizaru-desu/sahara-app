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
import * as XLSX from "xlsx";

export default function Home() {
  const router = useRouter();
  const outerTheme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);
  const [listBoothOwner, setlistBoothOwner] = React.useState<any[]>([]);
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
        const responseApi = await authService.getPageBoothOwnerData({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allBoothOwner, countBoothOwner, userDetail } =
            responseApi.data;
          setLoading(false);
          setlistBoothOwner(allBoothOwner);
          setTotalPage(Math.ceil(countBoothOwner / 100));
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

  const getAllBoothOwner = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getBoothOwner({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allBoothOwner, countBoothOwner } = responseApi.data;
          setLoading(false);
          setlistBoothOwner(allBoothOwner);
          setTotalPage(Math.ceil(countBoothOwner / 100));
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

  const searchBoothOwner = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.searchBoothOwner({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setlistBoothOwner(data);
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

  const exportBoothOwner = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new Services();
      const responseApi = await authService.exportBoothOwner();

      if (responseApi.status === 200) {
        setLoading(false);

        const ws = XLSX.utils.json_to_sheet(responseApi.data.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(
          wb,
          `Booth Owner ${moment().format("DD-MM-YYYY")}-${
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
                    searchBoothOwner({ value });
                  }}
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    exportBoothOwner();
                  }}
                  className="flex justify-center self-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                >
                  Export
                </button>
              </div>

              <DataGrid
                pagination={true}
                autoHeight
                getRowHeight={() => "auto"}
                rowSelection={false}
                rows={listBoothOwner}
                columns={[
                  {
                    field: "actions",
                    headerName: "Actions",
                    hideSortIcons: true,
                    disableColumnMenu: true,
                    minWidth: 325,
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

                              router.push(`/page/owner-booth/${params.id}`);
                            }}
                          >
                            Booth Member
                          </button>
                        </div>
                      );
                    },
                  },
                  {
                    field: "fullname",
                    headerName: "Owner Name",
                    minWidth: 350,
                    flex: 1,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "alamatOwner",
                    headerName: "Alamat Owner",
                    hideSortIcons: true,
                    disableColumnMenu: true,
                    minWidth: 350,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                    renderCell: (params) => {
                      return (
                        <div className="grid grid-rows-1 gap-2 my-2 place-content-center place-items-center">
                          <a
                            href={`https://maps.google.com?q=${params.value}`}
                            target="_blank"
                          >
                            <span>{params.value}</span>
                          </a>
                        </div>
                      );
                    },
                  },
                  {
                    field: "phone",
                    headerName: "No. HP",
                    minWidth: 350,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "email",
                    headerName: "Email",
                    minWidth: 350,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "dateEstablishment",
                    headerName: "Sejak Tahun",
                    minWidth: 350,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "totalBooth",
                    headerName: "Total Booth",
                    minWidth: 350,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "Instagram",
                    headerName: "Instagram",
                    minWidth: 350,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "facebook",
                    headerName: "Facebook",
                    minWidth: 350,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "ecommerce",
                    headerName: "E-Commerce",
                    minWidth: 350,
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "createdBy",
                    headerName: "Created By",
                    headerAlign: "center",
                    minWidth: 350,
                    editable: false,
                  },
                  {
                    field: "createdAt",
                    headerName: "Created At",
                    headerAlign: "center",
                    minWidth: 350,
                    editable: false,
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY hh:mm"),
                  },
                  {
                    field: "modifiedBy",
                    headerName: "Modified By",
                    headerAlign: "center",
                    minWidth: 350,
                    editable: false,
                  },
                  {
                    field: "modifedAt",
                    headerName: "Modifed At",
                    headerAlign: "center",
                    minWidth: 350,
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
                    getAllBoothOwner({
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
