"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import { InputAdornment, Pagination, TextField } from "@mui/material";
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
import Select from "react-dropdown-select";

interface addProducts {
  productName: string;
  productCode: string;
  weight: number;
  basePoint: number;
  unit: string;
  expiredPeriod: number;
  createdBy?: string;
}

export default function Home() {
  const router = useRouter();
  const outerTheme = useTheme();
  const inputFileRef = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);
  const [listProduct, setListProduct] = React.useState<any[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const [productInput, setProductInput] = React.useState<addProducts>({
    productName: "",
    productCode: "",
    basePoint: 0,
    weight: 0,
    unit: "",
    expiredPeriod: 0,
    createdBy: "",
  });
  const [selectUnit, setSelectUnit] = React.useState<any[]>([]);

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
        const responseApi = await authService.getPageProductData({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allProduct, countProduct, userDetail } = responseApi.data;
          setLoading(false);
          setListProduct(allProduct);
          setTotalPage(Math.ceil(countProduct / 100));
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

  const getAllProduct = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getProduct({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allProduct, countProduct } = responseApi.data;
          setLoading(false);
          setListProduct(allProduct);
          setTotalPage(Math.ceil(countProduct / 100));
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

  const addProduct = React.useCallback(
    async ({
      productName,
      productCode,
      weight,
      basePoint,
      unit,
      expiredPeriod,
    }: addProducts) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.addProduct({
          productName: productName,
          productCode: productCode,
          weight: Number(weight),
          basePoint: Number(basePoint),
          unit: unit,
          expiredPeriod: Number(expiredPeriod),
          createdBy: detailUsers.fullname,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          getAllProduct({ skip: 0, take: 100 });
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
    [detailUsers?.fullname, getAllProduct, logoutUser]
  );

  const searchProduct = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.searchProduct({
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

  const uploadFile = React.useCallback(
    async ({ formData }: { formData: any }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.uploadProduct({ formData });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: data,
            type: "success",
          });
          getAllProduct({ skip: 0, take: 100 });
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
    [getAllProduct, logoutUser]
  );

  const exportProduct = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new Services();
      const responseApi = await authService.exportProduct();

      if (responseApi.status === 200) {
        setLoading(false);

        const ws = XLSX.utils.json_to_sheet(responseApi.data.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(
          wb,
          `Product ${moment().format("DD-MM-YYYY")}-${
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

  const handleInputChangeAddProduct = (e: any) => {
    const { name, value } = e.target;

    setProductInput((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleButtonSelectFile = () => {
    inputFileRef.current?.click();
  };

  const handleFileChange = (e: any) => {
    const files = e.target.files;
    if (files) {
      const formData = new FormData();
      formData.append("files", files[0]);
      formData.append("createdBy", detailUsers?.fullname || "");
      uploadFile({ formData });
    }
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

                addProduct({
                  productName: productInput.productName,
                  productCode: productInput.productCode,
                  basePoint: productInput.basePoint,
                  weight: productInput.weight,
                  unit: selectUnit[0].value,
                  expiredPeriod: productInput.expiredPeriod,
                });
              }}
            >
              <h6 className="text-black font-bold">Add Product</h6>

              <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
                <TextField
                  name="productName"
                  id="productName"
                  label="Product Name"
                  type={"text"}
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeAddProduct}
                />

                <TextField
                  name="productCode"
                  id="productCode"
                  label="Product Code"
                  type={"text"}
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeAddProduct}
                />

                <TextField
                  name="weight"
                  id="weight"
                  label="Weight"
                  type={"number"}
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                    ),
                  }}
                  inputProps={{ step: 0.1 }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeAddProduct}
                />

                <Select
                  options={[
                    { label: "Pack", value: "Pack" },
                    { label: "Tiang", value: "Tiang" },
                    { label: "Pcs", value: "Pcs" },
                  ]}
                  valueField="value"
                  labelField="label"
                  color="#b91c1c"
                  searchBy="label"
                  searchable
                  required
                  clearable
                  className="text-black"
                  onChange={(values) => {
                    setSelectUnit(values);
                  }}
                  values={selectUnit}
                />

                <TextField
                  name="expiredPeriod"
                  id="expiredPeriod"
                  label="Expired Period"
                  type={"number"}
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeAddProduct}
                />

                <TextField
                  name="basePoint"
                  id="basePoint"
                  label="Base Point"
                  type={"number"}
                  size="small"
                  required
                  inputProps={{ min: 0 }}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeAddProduct}
                />
              </div>

              <button
                type="submit"
                className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Add Product
              </button>
            </form>

            <div className="m-10 flex flex-col">
              <div className="flex flex-row justify-between my-3">
                <Search
                  onSearch={({ value }) => {
                    searchProduct({ value });
                  }}
                />

                <div className="flex flex-row flex-wrap gap-5 justify-center items-center">
                  <TextField
                    type="file"
                    inputRef={inputFileRef}
                    onChange={handleFileChange}
                    inputProps={{ accept: ".xls, .xlsx" }}
                    required
                    style={{ display: "none" }}
                  />

                  <button
                    type="button"
                    onClick={handleButtonSelectFile}
                    className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                  >
                    Upload Product
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      exportProduct();
                    }}
                    className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                  >
                    Export
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();

                      const ws = XLSX.utils.json_to_sheet([
                        {
                          productName: "Daging Burger Sapi1",
                          weight: Number("2.5"),
                          unit: "Pack / Tiang / Pcs",
                          productCode: "SB1",
                          expiredPeriod: 100,
                        },
                      ] as any);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                      XLSX.writeFile(
                        wb,
                        `Sahara Product ${moment().format("DD-MM-YYYY")}-${
                          Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
                        }.xlsx`
                      );
                    }}
                    className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                  >
                    Template
                  </button>
                </div>
              </div>

              <div className="w-auto h-[700px]">
                <DataGrid
                  pagination={true}
                  getRowHeight={() => "auto"}
                  rowSelection={false}
                  rows={listProduct}
                  columns={[
                    {
                      field: "basePoint",
                      headerName: "Base Point",
                      minWidth: 100,
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
                      field: "productName",
                      headerName: "Product Name",
                      minWidth: 250,
                      align: "left",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "weight",
                      headerName: "Weight (Kg)",
                      minWidth: 250,
                      align: "right",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "unit",
                      headerName: "Unit",
                      minWidth: 250,
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "expiredPeriod",
                      headerName: "Expired Period",
                      minWidth: 250,
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
                    getAllProduct({
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
