"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import { Pagination, TextField } from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { customTheme } from "@/app/component/theme";
import { DataGrid } from "@mui/x-data-grid";
import { MdPrint, MdPrintDisabled } from "react-icons/md";
import Select from "react-dropdown-select";
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
  const [listLabel, setListLabel] = React.useState<any[]>([]);
  const [selectLabel, setSelectLabel] = React.useState<any[]>([]);
  const [labelId, setLabelId] = React.useState<string[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const [selectProduct, setSelectProduct] = React.useState<any[]>([]);
  const [manualInput, setManualInput] = React.useState<{
    shift: number;
    batch: string;
  }>({ shift: 0, batch: "" });

  const open = React.useCallback(() => {
    isMenuOpen(!menuOpen);
  }, [menuOpen]);

  const logoutUser = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new Services();
      const responseApi = await authService.logoutUser();

      if (responseApi.status === 200) {
        setLoading(false);
        router.replace("/");
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
        const responseApi = await authService.getPageLabelProductData({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allProduct, userDetail, allLabel, countLabel } =
            responseApi.data;
          setLoading(false);
          setListProduct(allProduct);
          setTotalPage(Math.ceil(countLabel / 100));
          setDetailUsers(userDetail);
          setListLabel(allLabel);
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

  const getAllLabelProduct = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getLabelProduct({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allLabel, countLabel } = responseApi.data;
          setLoading(false);
          setListLabel(allLabel);
          setTotalPage(Math.ceil(countLabel / 100));
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

  const addLabel = React.useCallback(async () => {
    try {
      setLoading(true);

      const dateString = new Date();

      const date = moment("20" + dateString, "YYMMDD");

      const excelBaseDate = moment("1900-01-02");
      const serialNumber = date.diff(excelBaseDate, "days");

      const authService = new Services();
      const responseApi = await authService.addLabelProduct({
        productId: selectProduct[0].productId,
        productCode: selectProduct[0].productCode,
        productName: selectProduct[0].productName,
        labelCode: `SBI${selectProduct[0].productCode}${serialNumber}${
          Math.floor(Math.random() * (9999 - 100 + 1)) + 100
        }${manualInput.shift}${manualInput.batch}`,
        shift: Number(manualInput.shift),
        batch: manualInput.batch,
        bestBefore: moment(new Date())
          .add(selectProduct[0].expiredPeriod, "days")
          .toDate(),
        createdBy: detailUsers.fullname,
      });

      if (responseApi.status === 200) {
        const { message } = responseApi.data;
        setLoading(false);
        toastMessage({
          message: message,
          type: "success",
        });
        getAllLabelProduct({ skip: 0, take: 100 });
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
    getAllLabelProduct,
    logoutUser,
    manualInput.batch,
    manualInput.shift,
    selectProduct,
  ]);

  const searchLabelProduct = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.searchLabelProduct({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setListLabel(data);
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

  const exportLabel = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new Services();
      const responseApi = await authService.printerLabelProduct({
        labelIds: labelId,
      });

      if (responseApi.status === 200) {
        const { message, data } = responseApi.data;
        setLoading(false);
        toastMessage({
          message: message,
          type: "success",
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Label");
        XLSX.writeFile(
          wb,
          `Printer ${moment().format("DD-MM-YYYY")}-${
            Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
          }.xlsx`
        );
        getAllLabelProduct({ skip: 0, take: 100 });
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
  }, [getAllLabelProduct, labelId, logoutUser]);

  React.useEffect(() => {
    getPageData({ skip: 0, take: 100 });
  }, [getPageData]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    setManualInput((prevData: any) => ({
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
              className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col"
              onSubmit={(e: any) => {
                e.preventDefault();
                addLabel();
              }}
            >
              <h6 className="text-black text-bold">
                <strong>Create label product</strong>
              </h6>

              <div className="grid grid-cols-2 gap-5">
                <Select
                  options={listProduct}
                  valueField="productId"
                  labelField="productName"
                  color="#b91c1c"
                  searchBy="productName"
                  searchable
                  required
                  clearable
                  className="text-black"
                  onChange={(values) => {
                    setSelectProduct(values);
                  }}
                  values={selectProduct}
                />

                <TextField
                  name="shift"
                  id="shift"
                  label="Shift"
                  type={"number"}
                  size="small"
                  required
                  inputProps={{ min: 0 }}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChange}
                />

                <TextField
                  name="batch"
                  id="batch"
                  label="Batch"
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChange}
                />
              </div>

              <button
                type="submit"
                className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Generate
              </button>
            </form>

            <div className="m-10 flex flex-col">
              <Search
                onSearch={({ value }) => {
                  searchLabelProduct({ value });
                }}
              />

              <DataGrid
                pagination={true}
                autoHeight
                getRowHeight={() => "auto"}
                rows={listLabel}
                checkboxSelection
                disableRowSelectionOnClick
                onRowSelectionModelChange={(ids: any) => {
                  const arrayId = _.split(ids, ",");
                  const filteredData = _.filter(listLabel, (item: any) =>
                    arrayId.includes(item.id)
                  );
                  setLabelId(arrayId);
                  setSelectLabel(filteredData);
                }}
                slots={{
                  toolbar: () => (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        exportLabel();
                      }}
                      className={`${
                        !_.isEmpty(selectLabel) ? "block" : "hidden"
                      } self-start m-2 justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700`}
                    >
                      Export to printing
                    </button>
                  ),
                }}
                columns={[
                  {
                    field: "productCode",
                    headerName: "Product Code",
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
                    field: "labelCode",
                    headerName: "Label Product Code",
                    minWidth: 250,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "shift",
                    headerName: "Shift",
                    minWidth: 50,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "batch",
                    headerName: "Batch",
                    minWidth: 150,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "bestBefore",
                    headerName: "Best Before",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY"),
                  },
                  {
                    field: "printed",
                    headerName: "Printed",
                    minWidth: 250,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                    renderCell: (params) => {
                      return params.value === 0 ? (
                        <MdPrintDisabled />
                      ) : (
                        <MdPrint />
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
                    getAllLabelProduct({
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
