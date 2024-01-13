"use client";

import React, { Suspense } from "react";
import _ from "lodash";
import { useRouter } from "next/navigation";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import { DataGrid } from "@mui/x-data-grid";
import Loading from "../loading";
import { AuthService } from "../utils/services/auth.service";
import { toastMessage } from "../component/toasttify";
import Loader from "../component/loader";
import { Pagination } from "@mui/material";
import { ProductService } from "../utils/services/product.service";
import moment from "moment";

interface UserData {
  fullname?: string;
  roleId?: {
    key: number;
  };
}

export default function Product() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [dataUser, setDataUser] = React.useState<UserData | undefined>(
    undefined
  );

  const [file, setFile] = React.useState<File | null>(null);

  const [formDataProduct, setFormDataProduct] = React.useState({
    productName: "",
    productCode: "",
    price: 0,
    weight: 0,
    unit: "",
    expiredPeriod: 0,
    createBy: "",
  });

  const [isTotalPage, setTotalPage] = React.useState(0);
  const [isCurrentPage, setCurrentPage] = React.useState(1);
  const [isAllDataProduct, setAllDataProduct] = React.useState([]);

  const [inputValue, setInputValue] = React.useState("");

  const open = React.useCallback(() => {
    isMenuOpen(!menuOpen);
  }, [menuOpen]);

  const logoutUser = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new AuthService();
      const responseApi = await authService.logout();

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

  const detailUser = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new AuthService();
      const responseApi = await authService.userDetail();

      if (responseApi.status === 200) {
        const { data } = responseApi.data;
        setLoading(false);
        setDataUser(data);
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

  const uploadFile = React.useCallback(
    async ({ formData }: { formData: any }) => {
      try {
        setLoading(true);
        const productService = new ProductService();
        const responseApi = await productService.uploadProduct({ formData });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: data,
            type: "success",
          });
          location.reload();
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
      price,
      weight,
      unit,
      expiredPeriod,
      createBy,
    }: {
      productName: string;
      productCode: string;
      price: number;
      weight: number;
      unit: string;
      expiredPeriod: number;
      createBy?: string;
    }) => {
      try {
        setLoading(true);
        const productService = new ProductService();
        const responseApi = await productService.addProduct({
          productName,
          productCode,
          price,
          weight,
          unit,
          expiredPeriod,
          createBy,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          location.reload();
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
        const productService = new ProductService();
        const responseApi = await productService.getAllProduct({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { data, countUser } = responseApi.data;
          setLoading(false);
          setAllDataProduct(data);
          setTotalPage(Math.ceil(countUser / 100));
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

  const searchProduct = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const productService = new ProductService();
        const responseApi = await productService.searchProduct({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setAllDataProduct(data);
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
    detailUser();
    getAllProduct({ skip: 0, take: 100 });
  }, [detailUser, getAllProduct]);

  const handleFileChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const selectedFile = event.currentTarget.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleFormSubmitFile = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!file) {
      console.error("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("files", file);
    formData.append("createBy", dataUser?.fullname || "");

    uploadFile({ formData });
  };

  const handleInputChangeProduct = (e: any) => {
    const { name, value } = e.target;

    setFormDataProduct((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitAddProduct = (event: any) => {
    event.preventDefault();

    const {
      productName,
      productCode,
      price,
      weight,
      unit,
      expiredPeriod,
      createBy,
    } = formDataProduct;

    addProduct({
      productName,
      productCode,
      price: parseFloat(price.toString()),
      weight: parseFloat(weight.toString()),
      unit,
      expiredPeriod: parseFloat(expiredPeriod.toString()),
      createBy,
    });
  };

  const handleChange = async (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
    getAllProduct({
      skip: Math.max(0, (value - 1) * 100),
      take: 100,
    });
  };

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleSubmitSearch = (event: any) => {
    event.preventDefault();

    if (!_.isEmpty(inputValue)) {
      searchProduct({ value: inputValue });
    } else {
      toastMessage({ message: "Please input value search...", type: "error" });
    }
  };

  return (
    <main className="dark:bg-white bg-white min-h-screen">
      <SideBar opens={menuOpen} closeds={open} roles={dataUser?.roleId?.key} />
      <NavBar
        items={{ label: "Product", link: "#" }}
        opens={open}
        data={dataUser}
      />

      <Suspense fallback={<Loading />}>
        <div className="p-4 xl:ml-80 gap-5">
          <div className="grid grid-cols-1 gap-5 place-content-center place-items-start md:grid-cols-2">
            <form
              className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col"
              onSubmit={handleSubmitAddProduct}
            >
              <h6 className="text-black text-bold">
                <strong>Add Product</strong>
              </h6>
              <div>
                <label
                  htmlFor="productName"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Product Name
                </label>
                <div className="mt-2">
                  <input
                    id="productName"
                    name="productName"
                    type="text"
                    required
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    onChange={handleInputChangeProduct}
                  />
                </div>
              </div>

              <div className="flex flex-row gap-5 flex-wrap">
                <div>
                  <label
                    htmlFor="productCode"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Product Code
                  </label>
                  <div className="mt-2">
                    <input
                      id="productCode"
                      name="productCode"
                      type="text"
                      required
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                      onChange={handleInputChangeProduct}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Price (Rupiah)
                  </label>
                  <div className="mt-2">
                    <input
                      id="price"
                      name="price"
                      type="number"
                      required
                      placeholder="Example: 10000"
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                      onChange={handleInputChangeProduct}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Weight (Kg)
                  </label>
                  <div className="mt-2 flex flex-row">
                    <input
                      id="weight"
                      name="weight"
                      type="number"
                      required
                      step="0.1"
                      placeholder="example: 0.1"
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                      onChange={handleInputChangeProduct}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="unit"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Unit
                  </label>
                  <div className="mt-2 flex flex-row">
                    <input
                      id="unit"
                      name="unit"
                      type="text"
                      required
                      placeholder="example: Pack/etc"
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                      onChange={handleInputChangeProduct}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="expiredPeriod"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Expired Period (day)
                  </label>
                  <div className="mt-2 flex flex-row">
                    <input
                      id="expiredPeriod"
                      name="expiredPeriod"
                      type="number"
                      required
                      placeholder="example: 20"
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                      onChange={handleInputChangeProduct}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Simpan
              </button>
            </form>

            <form
              className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col my-5"
              onSubmit={handleFormSubmitFile}
            >
              <div>
                <label
                  htmlFor="uploadProduct"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Upload product
                </label>
                <div className="mt-2">
                  <input
                    id="uploadProduct"
                    name="files"
                    type="file"
                    required
                    accept=".xls, .xlsx"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Upload
              </button>

              <a
                href="./template/product.xlsx"
                className="flex justify-center rounded-md self-end
               bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Download Template
              </a>
            </form>
          </div>

          <div className="m-10 flex flex-col">
            <form
              className="flex flex-row items-center m-[2px] mb-3"
              action="#"
              method="POST"
              onSubmit={handleSubmitSearch}
            >
              <div className="relative mr-5 float-left">
                <label htmlFor="inputSearch" className="sr-only">
                  Search{" "}
                </label>
                <input
                  id="inputSearch"
                  type="text"
                  placeholder="Search product name/code ..."
                  className="block w-[280px] text-black placeholder:text-black rounded-lg dark:border-red-700 border-2 py-2 pl-10 pr-4 text-sm focus:border-red-900 focus:outline-none focus:ring-1 focus:ring-red-900"
                  onChange={handleInputChange}
                  minLength={3}
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-4 w-4 text-red-700 dark:text-red-700"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </span>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                >
                  Search
                </button>
              </div>
            </form>

            <DataGrid
              pagination={true}
              autoHeight
              getRowHeight={() => "auto"}
              rowSelection={false}
              rows={isAllDataProduct}
              columns={[
                {
                  field: "productCode",
                  headerName: "product Code",
                  minWidth: 150,
                  align: "left",
                  headerAlign: "center",
                },
                {
                  field: "productName",
                  headerName: "Product Name",
                  minWidth: 500,
                  align: "left",
                  headerAlign: "center",
                },
                {
                  field: "weight",
                  headerName: "weight (Kg)",
                  minWidth: 150,
                  align: "center",
                  headerAlign: "center",
                },
                {
                  field: "price",
                  headerName: "Price (Rp.)",
                  minWidth: 150,
                  align: "right",
                  headerAlign: "center",
                },
                {
                  field: "unit",
                  headerName: "Unit",
                  minWidth: 150,
                  align: "right",
                  headerAlign: "center",
                },
                {
                  field: "expiredPeriod",
                  headerName: "expired Period",
                  minWidth: 150,
                  align: "right",
                  headerAlign: "center",
                },
                {
                  field: "createBy",
                  headerName: "createBy",
                  minWidth: 150,
                  align: "right",
                  headerAlign: "center",
                },
                {
                  field: "modifiedBy",
                  headerName: "modifiedBy",
                  minWidth: 150,
                  align: "right",
                  headerAlign: "center",
                },
                {
                  field: "createdAt",
                  headerName: "createdAt",
                  minWidth: 150,
                  align: "right",
                  headerAlign: "center",
                  renderCell: (params) => {
                    return (
                      <span className="text-black">
                        {moment(params.value).format("DD-MM-YYYY hh:mm")}
                      </span>
                    );
                  },
                },
                {
                  field: "modifedAt",
                  headerName: "modifedAt",
                  minWidth: 150,
                  align: "right",
                  headerAlign: "center",
                  renderCell: (params) => {
                    return (
                      <span className="text-black">
                        {moment(params.value).format("DD-MM-YYYY hh:mm")}
                      </span>
                    );
                  },
                },
              ]}
            />

            <div className="flex justify-center py-4">
              <Pagination
                count={isTotalPage}
                page={isCurrentPage}
                onChange={handleChange}
                shape="rounded"
              />
            </div>
          </div>
        </div>
      </Suspense>

      <Loader active={loading} />
    </main>
  );
}
