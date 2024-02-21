"use client";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import { Pagination, Dialog, DialogContent } from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { customTheme } from "@/app/component/theme";
import { DataGrid } from "@mui/x-data-grid";
import { DateRange } from "react-date-range";
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
  const [listLoyaltyLog, setLoyaltyLog] = React.useState<any[]>([]);
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
        const responseApi = await authService.getPageLoyaltyPointLogData({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allLoyaltyLog, countLoyaltyLog, userDetail } =
            responseApi.data;
          setLoading(false);
          setLoyaltyLog(allLoyaltyLog);
          setTotalPage(Math.ceil(countLoyaltyLog / 100));
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

  const getAllLoyalty = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getLoyaltyPointLog({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allLoyaltyLog, countLoyaltyLog } = responseApi.data;
          setLoading(false);
          setLoyaltyLog(allLoyaltyLog);
          setTotalPage(Math.ceil(countLoyaltyLog / 100));
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

  const searchLoyalty = React.useCallback(
    async ({ value }: { value: string }) => {
      try {
        setLoading(true);

        const authService = new Services();
        const responseApi = await authService.searchLoyaltyLog({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setLoyaltyLog(data);
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

  React.useEffect(() => {
    getPageData({ skip: 0, take: 500 });
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
          <div className="p-4 xl:ml-80 gap-12 min-h-screen">
            <Search
              onSearch={({ value }) => {
                searchLoyalty({ value });
              }}
            />

            <div className="w-auto h-[700px]">
              <DataGrid
                pagination={true}
                getRowHeight={() => "auto"}
                rows={listLoyaltyLog}
                getRowId={(rows) => rows.pointLogId}
                disableRowSelectionOnClick
                columns={[
                  {
                    field: "productName",
                    headerName: "ProductName",
                    minWidth: 250,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "productCode",
                    headerName: "Product Code",
                    minWidth: 250,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "loyaltyPoint",
                    headerName: "Point",
                    minWidth: 150,
                    align: "right",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "remark",
                    headerName: "Remarks",
                    minWidth: 250,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "labelProducts",
                    headerName: "Product Label",
                    minWidth: 250,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "scanDate",
                    headerName: "Scan Date",
                    headerAlign: "center",
                    minWidth: 250,
                    editable: false,
                    valueFormatter: (params: any) => {
                      if (!_.isEmpty(params.value)) {
                        return moment(params?.value ?? new Date()).format(
                          "DD/MM/YYYY hh:mm"
                        );
                      } else {
                        return null;
                      }
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
                  getAllLoyalty({
                    skip: Math.max(0, (value - 1) * 100),
                    take: 100,
                  });
                }}
                shape="rounded"
              />
            </div>
          </div>
        </Suspense>

        <Loader active={loading} />
      </main>
    </ThemeProvider>
  );
}
