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
import moment from "moment";

export default function Home({ params }: { params: { id: string } }) {
  const router = useRouter();
  const outerTheme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);
  const [listDeliveryOrder, setListDeliveryOrder] = React.useState<any[]>([]);

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
        const responseApi = await authService.getPageDeliveryProductData({
          skip,
          take,
          suratJalanId: params.id,
        });

        if (responseApi.status === 200) {
          const { allSurat, totalSurat, userDetail } = responseApi.data;
          setLoading(false);
          setListDeliveryOrder(allSurat);

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
            <div className="w-auto h-[700px]">
              <DataGrid
                pagination={true}
                getRowHeight={() => "auto"}
                rows={listDeliveryOrder}
                getRowId={(rows) => rows.suratJalanProductId}
                disableRowSelectionOnClick
                columns={[
                  {
                    field: "labelBox",
                    headerName: "Label Box",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "box",
                    headerName: "Product List",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                    renderCell: (params) => {
                      return (
                        <div className="flex flex-col gap-5">
                          {_.map(
                            _.uniqBy(params.value.labelProduct, "productId"),
                            (item: any) => {
                              return (
                                <span>
                                  [{item.productCode}] {item.productName}
                                </span>
                              );
                            }
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    field: "shipQty",
                    headerName: "Ship Qty",
                    minWidth: 50,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "recaivedQty",
                    headerName: "Recaive Qty",
                    minWidth: 50,
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
          </div>
        </Suspense>

        <Loader active={loading} />
      </main>
    </ThemeProvider>
  );
}
