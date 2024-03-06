"use client";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import {
  Pagination,
  Dialog,
  DialogContent,
  TextField,
  Button,
} from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { customTheme } from "@/app/component/theme";
import { DataGrid } from "@mui/x-data-grid";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import _ from "lodash";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import Loader from "@/app/component/loader";
import Loading from "@/app/loading";
import Search from "@/app/component/search";
import moment from "moment";
import MyDoc from "@/app/component/templateDR";

export default function Home() {
  const router = useRouter();
  const outerTheme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);
  const [listDeliveryOrder, setListDeliveryOrder] = React.useState<any[]>([]);
  const [listDataProduct, setListDataProduct] = React.useState<any[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [openRecaive, setOpenRecaive] = React.useState<boolean>(false);
  const [suratJalanId, setSuratJalanId] = React.useState<string>("");

  const [recaiveForm, setRecaiveForm] = React.useState({
    recaiveDate: "",
    recaiveBy: "",
    recaiveNote: "",
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
        const responseApi = await authService.getPageDeliveryData({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allSurat, totalSurat, userDetail } = responseApi.data;
          setLoading(false);
          setListDeliveryOrder(allSurat);
          setTotalPage(Math.ceil(totalSurat / 100));
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

  const getAllDeliveryOrder = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getDeliveryOrder({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allSurat, totalSurat } = responseApi.data;
          setLoading(false);
          setListDeliveryOrder(allSurat);
          setTotalPage(Math.ceil(totalSurat / 100));
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

  const getAllDeliveryOrderGenerate = React.useCallback(
    async ({ suratJalanId }: { suratJalanId: string }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getDeliveryOrderPdf({
          suratJalanId,
          createdBy: detailUsers.fullname,
        });

        if (responseApi.status === 200) {
          const { findSuratJalan, findProductInStock } = responseApi.data;
          setLoading(false);

          const groupedData = _.chain(findProductInStock)
            .groupBy("productId")
            .map((value) => ({
              productName: value[0].productName,
              qty: value.length,
              unit: value[0].unit,
            }))
            .value();

          const blob = await pdf(
            <MyDoc
              dataProduct={groupedData}
              shippingDate={findSuratJalan.shippingDate}
              customerName={findSuratJalan.customerName}
              alamatToko={findSuratJalan.deliveryAddress}
              noSurat={findSuratJalan.noSurat}
              noOrder={findSuratJalan.orderNo}
              totalWeight={findSuratJalan.totalWeight}
            />
          ).toBlob();
          saveAs(blob, `${findSuratJalan.noSurat}`);
          getPageData({ skip: 0, take: 500 });
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
    [detailUsers?.fullname, getPageData, logoutUser]
  );

  const searchDeliveryOrder = React.useCallback(
    async ({ value }: { value: string }) => {
      try {
        setLoading(true);

        const authService = new Services();
        const responseApi = await authService.searchDeliveryOrder({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setListDeliveryOrder(data);
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

  const getRecaiveProduct = React.useCallback(
    async ({ suratJalanId }: { suratJalanId: string }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getRecaiveProduct({
          suratJalanId: suratJalanId,
        });

        if (responseApi.status === 200) {
          const { productSuratJalan } = responseApi.data;
          setLoading(false);
          setListDataProduct(productSuratJalan);
          setOpenRecaive(true);
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

  const recaiveProduct = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new Services();
      const responseApi = await authService.recaiveDeliveryOrder({
        suratJalanId: suratJalanId,
        recaiveBy: recaiveForm.recaiveBy,
        recaiveDate: moment(recaiveForm.recaiveDate).toISOString(),
        recaiveNote: recaiveForm.recaiveNote,
        createdBy: detailUsers?.fullname,
        dataQty: _.map(
          listDataProduct,
          ({ suratJalanProductId, recaivedQty }) => ({
            suratJalanProductId,
            recaivedQty,
          })
        ),
      });

      if (responseApi.status === 200) {
        const { message } = responseApi.data;
        setLoading(false);
        toastMessage({
          message: message,
          type: "success",
        });

        setListDataProduct([]);
        getPageData({ skip: 0, take: 500 });
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
    detailUsers?.fullname,
    getPageData,
    listDataProduct,
    logoutUser,
    recaiveForm.recaiveBy,
    recaiveForm.recaiveDate,
    recaiveForm.recaiveNote,
    suratJalanId,
  ]);

  const cancelProduct = React.useCallback(
    async ({ suratJalanId }: { suratJalanId: string }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.cancelDeliveryOrder({
          suratJalanId,
          createdBy: detailUsers?.fullname,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });

          setListDataProduct([]);
          getPageData({ skip: 0, take: 500 });
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
    [detailUsers?.fullname, getPageData, logoutUser]
  );

  React.useEffect(() => {
    getPageData({ skip: 0, take: 500 });
  }, [getPageData]);

  const handleChange = (index: number, event: any) => {
    const newData = [...listDataProduct];
    newData[index].recaivedQty = Number(event.target.value);
    setListDataProduct(newData);
  };

  const handleChangeRecaive = (e: any) => {
    const { name, value } = e.target;

    setRecaiveForm((prevData: any) => ({
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
          <div className="p-4 xl:ml-80 gap-12 min-h-screen">
            <Search
              onSearch={({ value }) => {
                searchDeliveryOrder({ value });
              }}
            />

            <div className="w-auto h-[700px]">
              <DataGrid
                pagination={true}
                getRowHeight={() => "auto"}
                rows={listDeliveryOrder}
                getRowId={(rows) => rows.suratJalanId}
                disableRowSelectionOnClick
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
                      const statusComplete =
                        params.row.status === 3 ? true : false;
                      return (
                        <div className="flex flex-row gap-5 my-2 mx-2 place-content-center place-items-center">
                          <button
                            type="button"
                            disabled={statusComplete}
                            className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                            onClick={(e: any) => {
                              e.preventDefault();

                              router.push(`/page/delivery-order/${params.id}`);
                            }}
                          >
                            List Product Box
                          </button>

                          <button
                            type="button"
                            className={`${
                              params.row.status === 1 ? "block" : "hidden"
                            } justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700`}
                            onClick={async (e: any) => {
                              e.preventDefault();

                              getAllDeliveryOrderGenerate({
                                suratJalanId: params.id.toString(),
                              });
                            }}
                          >
                            Submit DR
                          </button>

                          <button
                            type="button"
                            className={`${
                              params.row.status === 2 ? "block" : "hidden"
                            } justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700`}
                            onClick={async (e: any) => {
                              e.preventDefault();

                              getRecaiveProduct({
                                suratJalanId: params.id.toString(),
                              });
                              setSuratJalanId(params.id.toString());
                            }}
                          >
                            Recaive
                          </button>

                          <button
                            type="button"
                            className={`${
                              params.row.status === 1 ? "block" : "hidden"
                            } justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700`}
                            onClick={(e: any) => {
                              e.preventDefault();
                              cancelProduct({
                                suratJalanId: params.id.toString(),
                              });
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      );
                    },
                  },
                  {
                    field: "noSurat",
                    headerName: "Nomer Surat",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "orderNo",
                    headerName: "Order No",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "shippingDate",
                    headerName: "Shipping Date",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY HH:MM"),
                  },

                  {
                    field: "deliveryAddress",
                    headerName: "Delivery Address",
                    minWidth: 250,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "totalWeight",
                    headerName: "Total Weight (KG)",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
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
                        { text: "On Created", color: "bg-blue-500" },
                        { text: "On Delivery", color: "bg-yellow-500" },
                        { text: "Recaive", color: "bg-green-500" },
                        { text: "Canceled", color: "bg-red-500" },
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
                    field: "deliveryNote",
                    headerName: "Delivery Note",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "recaiveDate",
                    headerName: "Recaive Date",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                    valueFormatter: (params: any) => {
                      return params?.value
                        ? moment(params?.value).format("DD/MM/YYYY HH:MM")
                        : null;
                    },
                  },
                  {
                    field: "recaiveBy",
                    headerName: "Recaive By",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "recaiveNote",
                    headerName: "Recaive Note",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
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
                    align: "center",
                    headerAlign: "center",
                    minWidth: 250,
                    editable: false,
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY HH:MM"),
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
                      moment(params?.value).format("DD/MM/YYYY HH:MM"),
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
                  getAllDeliveryOrder({
                    skip: Math.max(0, (value - 1) * 100),
                    take: 100,
                  });
                }}
                shape="rounded"
              />
            </div>
          </div>

          <Dialog
            open={openRecaive}
            onClose={() => {
              setOpenRecaive(false);
              setListDataProduct([]);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
              component: "form",
              onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                recaiveProduct();
                setOpenRecaive(false);
              },
            }}
          >
            <DialogContent className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
              <h6 className="text-black text-bold text-lg text-center">
                <strong>Data Product</strong>
              </h6>

              <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
                <TextField
                  id="recaiveDate"
                  name="recaiveDate"
                  label="Recaive Date"
                  type={"datetime-local"}
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  onChange={handleChangeRecaive}
                />

                <TextField
                  id="recaiveBy"
                  name="recaiveBy"
                  label="Recaive By"
                  type={"text"}
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  onChange={handleChangeRecaive}
                />

                <TextField
                  id="recaiveNote"
                  name="recaiveNote"
                  label="Recaive Note"
                  type={"text"}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  onChange={handleChangeRecaive}
                />
              </div>
              {_.map(listDataProduct, (item: any, index: number) => {
                return (
                  <div
                    key={index.toString()}
                    className="grid grid-cols-3 gap-5"
                  >
                    <TextField
                      label="Label Box"
                      type={"text"}
                      size="small"
                      required
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      value={item.labelBox}
                      inputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Qty"
                      inputProps={{ readOnly: true }}
                      type={"number"}
                      size="small"
                      required
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      value={item.shipQty}
                    />
                    <TextField
                      id={`recaivedQty_${index}`}
                      label="Recaive Qty"
                      type={"number"}
                      size="small"
                      required
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      value={item.recaivedQty}
                      onChange={(event) => handleChange(index, event)}
                    />
                  </div>
                );
              })}

              <button
                type="submit"
                className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:bg-red-300"
              >
                Recaive
              </button>
            </DialogContent>
          </Dialog>
        </Suspense>

        <Loader active={loading} />
      </main>
    </ThemeProvider>
  );
}
