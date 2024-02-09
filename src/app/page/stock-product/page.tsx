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
  const [listProduct, setListProduct] = React.useState<any[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [selectProduct, setSelectProduct] = React.useState<any[]>([]);

  const [rangeOpen, setRangeOpen] = React.useState<boolean>(false);
  const [rangeDate, setRangeDate] = React.useState<any[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

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
        const responseApi = await authService.getPageStockProductData({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allStock, countStock, userDetail } = responseApi.data;
          setLoading(false);
          setListProduct(allStock);
          setTotalPage(Math.ceil(countStock / 100));
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

  const getAllStockProduct = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getStockProduct({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allStockProduct, countStockProduct } = responseApi.data;
          setLoading(false);
          setListProduct(allStockProduct);
          setTotalPage(Math.ceil(countStockProduct / 100));
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

  const searchStockRange = React.useCallback(async () => {
    try {
      setLoading(true);

      const authService = new Services();
      const responseApi = await authService.searchRangeStockProduct({
        rangeDate: {
          startDate: moment(rangeDate[0].startDate).startOf("day").format(),
          endDate: moment(rangeDate[0].endDate).startOf("day").format(),
        },
      });

      if (responseApi.status === 200) {
        const { data } = responseApi.data;
        setLoading(false);
        setListProduct(data);
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
  }, [logoutUser, rangeDate]);

  const searchStock = React.useCallback(
    async ({ value }: { value: string }) => {
      try {
        setLoading(true);

        const authService = new Services();
        const responseApi = await authService.searchStockProduct({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setListProduct(data);
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
    getPageData({ skip: 0, take: 1000 });
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
            <div className="flex flex-row gap-5 place-items-center justify-between">
              <Search
                onSearch={({ value }) => {
                  searchStock({ value });
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setRangeOpen(true);
                }}
                className="flex justify-center self-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:bg-red-300"
              >
                Select Date
              </button>
            </div>

            <DataGrid
              pagination={true}
              autoHeight
              getRowHeight={() => "auto"}
              rows={listProduct}
              getRowId={(rows) => rows.stockId}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={(ids: any) => {
                const arrayId = _.split(ids, ",");
                const filteredData = _.filter(listProduct, (item: any) =>
                  arrayId.includes(item.stockId)
                );

                setSelectProduct(filteredData);
              }}
              slots={{
                toolbar: () => (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const ws = XLSX.utils.json_to_sheet(selectProduct);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Stock Product");
                      XLSX.writeFile(
                        wb,
                        `Stock Product ${moment().format("DD-MM-YYYY")}-${
                          Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
                        }.xlsx`
                      );
                    }}
                    className={`${
                      !_.isEmpty(selectProduct) ? "block" : "hidden"
                    } self-start m-2 justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700`}
                  >
                    Export
                  </button>
                ),
              }}
              columns={[
                {
                  field: "status",
                  headerName: "Status",
                  minWidth: 250,
                  align: "center",
                  headerAlign: "center",
                  editable: false,
                  renderCell: (params) => {
                    const sampleNames: any = {
                      1: "Created",
                      2: "InStock",
                      3: "OnDelivery",
                      4: "Sold",
                      5: "Expired",
                      6: "Damage",
                    };

                    const statusText =
                      (sampleNames[params.value] as any) || ("Unknown" as any);

                    return <span className="text-black">{statusText}</span>;
                  },
                },
                {
                  field: "location",
                  headerName: "Location",
                  minWidth: 250,
                  align: "left",
                  headerAlign: "center",
                  editable: false,
                },
                {
                  field: "productName",
                  headerName: "Product Name",
                  minWidth: 250,
                  align: "left",
                  headerAlign: "center",
                  editable: false,
                },
                {
                  field: "productCode",
                  headerName: "Product Code",
                  minWidth: 250,
                  align: "center",
                  headerAlign: "center",
                  editable: false,
                },
                {
                  field: "labelProducts",
                  headerName: "Label Product",
                  minWidth: 250,
                  align: "left",
                  headerAlign: "center",
                  editable: false,
                },

                {
                  field: "labelBoxs",
                  headerName: "Label Box",
                  minWidth: 250,
                  align: "left",
                  headerAlign: "center",
                  editable: false,
                },
                {
                  field: "weight",
                  headerName: "wieght (kg)",
                  minWidth: 50,
                  align: "right",
                  headerAlign: "center",
                  editable: false,
                },
                {
                  field: "unit",
                  headerName: "Unit",
                  minWidth: 250,
                  align: "left",
                  headerAlign: "center",
                  editable: false,
                },
                {
                  field: "expiredDate",
                  headerName: "Expired Date",
                  headerAlign: "center",
                  minWidth: 250,
                  editable: false,
                  valueFormatter: (params: any) =>
                    moment(params?.value).format("DD/MM/YYYY"),
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
                  getAllStockProduct({
                    skip: Math.max(0, (value - 1) * 1000),
                    take: 1000,
                  });
                }}
                shape="rounded"
              />
            </div>
          </div>

          <Dialog
            open={rangeOpen}
            onClose={() => {
              setRangeOpen(false);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent className="bg-white w-full justify-center items-center gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
              <DateRange
                editableDateInputs={false}
                onChange={(item) => setRangeDate([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={rangeDate}
                minDate={moment().subtract(90, "days").toDate()}
              />

              <div className="flex flex-row gap-5">
                {" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setRangeOpen(false);
                    searchStockRange();
                  }}
                  className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:bg-red-300"
                >
                  Search
                </button>{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setRangeOpen(false);
                  }}
                  className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:bg-red-300"
                >
                  Cancel
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
