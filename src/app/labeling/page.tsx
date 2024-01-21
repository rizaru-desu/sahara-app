"use client";

import React, { Suspense } from "react";
import _ from "lodash";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import Loading from "../loading";
import Loader from "../component/loader";
import Select from "react-select";
import { AuthService } from "../utils/services/auth.service";
import { toastMessage } from "../component/toasttify";
import { ProductService } from "../utils/services/product.service";
import { useRouter } from "next/navigation";
import moment from "moment";
import { Pagination } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FaBan, FaCheck } from "react-icons/fa";
import * as XLSX from "xlsx";

interface UserData {
  fullname: string;
  roleId?: {
    key: number;
  };
}

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [dataUser, setDataUser] = React.useState<UserData | undefined>(
    undefined
  );

  const [isAllDataProduct, setAllDataProduct] = React.useState([]);

  const [isTotalPage, setTotalPage] = React.useState(0);
  const [isCurrentPage, setCurrentPage] = React.useState(1);
  const [isAllDataLabel, setAllDataLabel] = React.useState([]);
  const [selectLabel, setSelectLabel] = React.useState<any[]>([]);

  const [inputValue, setInputValue] = React.useState("");

  const [formDataProduct, setFormDataProduct] = React.useState({
    productId: "",
    productName: "",
    productCode: "",
    price: 0,
    weight: 0,
    unit: "",
    expiredPeriod: 0,
    createBy: "",
    modifiedBy: "",
    createdAt: undefined,
    modifedAt: undefined,
  });

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

      const { data } = responseApi.data;
      if (responseApi.status === 200) {
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

  const getAllProduct = React.useCallback(async () => {
    try {
      setLoading(true);
      const productService = new ProductService();
      const responseApi = await productService.getAllProductLabel();

      if (responseApi.status === 200) {
        const { data } = responseApi.data;
        setLoading(false);
        setAllDataProduct(data);
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

  const findProduct = React.useCallback(
    async ({ productId }: { productId: string }) => {
      try {
        setLoading(true);
        const productService = new ProductService();
        const responseApi = await productService.findProduct({
          productId,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setFormDataProduct(data);
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

  const getListLabel = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const productService = new ProductService();
        const responseApi = await productService.getAllProductLabelPagination({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { data, countUser } = responseApi.data;
          setLoading(false);
          setAllDataLabel(data);
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

  const addLabelProduct = React.useCallback(
    async ({
      productId,
      productCode,
      barcodeType,
      status,
      bestBefore,
    }: {
      productId: string;
      productCode: string;
      barcodeType: number;
      status: number;
      bestBefore: Date;
    }) => {
      try {
        setLoading(true);
        const productService = new ProductService();
        const responseApi = await productService.addLabelProduct({
          productId,
          productCode,
          status,
          barcodeType,
          bestBefore,
          createBy: dataUser?.fullname,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          getListLabel({ skip: 0, take: 100 });
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
        } else if (e.response && e.response.status === 401) {
          logoutUser();
        } else {
          toastMessage({ message: e.message, type: "error" });
        }
      }
    },
    [dataUser?.fullname, getListLabel, logoutUser]
  );

  React.useEffect(() => {
    detailUser();
    getAllProduct();
    getListLabel({ skip: 0, take: 100 });
  }, [detailUser, getAllProduct, getListLabel]);

  const handleChangePagination = async (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
    getListLabel({ skip: Math.max(0, (value - 1) * 100), take: 100 });
  };

  const handleChange = (selectedOption: any) => {
    if (selectedOption) {
      findProduct({ productId: selectedOption.value });
    }
  };

  const handleGenerateQRCode = (event: any) => {
    event.preventDefault();

    const { productCode, expiredPeriod, productId } = formDataProduct;

    addLabelProduct({
      productId,
      productCode: `SBI${moment().format("YYMMDD")}${productCode}${
        Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
      }`,
      barcodeType: 1,
      bestBefore: moment(new Date()).add(expiredPeriod, "days").toDate(),
      status: 1,
    });
  };

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleSubmitSearch = (event: any) => {
    event.preventDefault();

    if (!_.isEmpty(inputValue)) {
      // searchProduct({ value: inputValue });
    } else {
      toastMessage({ message: "Please input value search...", type: "error" });
    }
  };

  return (
    <main className="dark:bg-white bg-white min-h-screen">
      <SideBar opens={menuOpen} closeds={open} roles={dataUser?.roleId?.key} />
      <NavBar
        items={{ label: "Labeling", link: "#" }}
        opens={open}
        data={dataUser}
      />

      <Suspense fallback={<Loading />}>
        <div className="p-4 xl:ml-80 gap-5">
          <form
            className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col "
            onSubmit={handleGenerateQRCode}
          >
            <h6 className="text-black text-bold">
              <strong>Create label product</strong>
            </h6>

            <Select
              options={isAllDataProduct}
              isSearchable
              isClearable
              placeholder="Select product ..."
              theme={(theme) => ({
                ...theme,
                borderRadius: 5,
                colors: {
                  ...theme.colors,
                  primary75: "#F44336",
                  primary25: "white",
                  primary: "#F44336",
                  primary50: "white",
                },
                borderWidth: 2,
              })}
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  borderColor: "#F44336",
                }),
                option: (baseStyles, state) => ({
                  ...baseStyles,
                  color: state.isSelected ? "white" : "black",
                }),
              }}
              onChange={handleChange}
            />

            {formDataProduct.productId !== "" ? (
              <div className="grid md:grid-cols-2 grid-cols-1 grid-rows-4 gap-3">
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
                      disabled
                      value={formDataProduct.productName}
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
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
                      disabled
                      value={formDataProduct.productCode}
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
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
                      disabled
                      value={formDataProduct.price}
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
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
                      step="0.1"
                      disabled
                      value={formDataProduct.weight}
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
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
                      disabled
                      value={formDataProduct.unit}
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
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
                      disabled
                      value={formDataProduct.expiredPeriod}
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 col-start-1 col-span-2 h-10"
                >
                  Save
                </button>
              </div>
            ) : null}
          </form>

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
              rows={isAllDataLabel}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={(ids: any) => {
                const arrayId = _.split(ids, ",");
                const filteredData = _.filter(isAllDataLabel, (item: any) =>
                  arrayId.includes(item.id)
                );

                setSelectLabel(filteredData);
              }}
              slots={{
                toolbar: () => (
                  <button
                    onClick={() => {
                      const ws = XLSX.utils.json_to_sheet(selectLabel);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                      XLSX.writeFile(
                        wb,
                        `Sahara ${moment().format("DD-MM-YYYY")}-${
                          Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
                        }.xlsx`
                      );
                    }}
                    className={`${
                      !_.isEmpty(selectLabel) ? "block" : "hidden"
                    } self-start m-2 justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700`}
                  >
                    Export
                  </button>
                ),
              }}
              columns={[
                {
                  field: "productCode",
                  headerName: "SKU (Product Code)",
                  minWidth: 150,
                  align: "left",
                  headerAlign: "center",
                },
                {
                  field: "bestBefore",
                  headerName: "Best Before",
                  minWidth: 150,
                  align: "right",
                  headerAlign: "center",
                  renderCell: (params) => {
                    return (
                      <span className="text-black">
                        {moment(params.value)
                          .local()
                          .format("DD-MM-YYYY HH:mm")}
                      </span>
                    );
                  },
                },
                {
                  field: "barcodeType",
                  headerName: "Barcode Type",
                  minWidth: 150,
                  align: "left",
                  headerAlign: "center",
                  renderCell: (params) => {
                    return (
                      <span className="text-black">
                        {params.value === 1 ? "Product Barcode" : "Box Barcode"}
                      </span>
                    );
                  },
                },
                {
                  field: "status",
                  headerName: "Has printed",
                  minWidth: 150,
                  align: "center",
                  headerAlign: "center",
                  renderCell: (params) => {
                    return params.value === 2 ? (
                      <FaCheck size={25} color={"black"} />
                    ) : (
                      <FaBan size={25} color={"black"} />
                    );
                  },
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
                        {moment(params.value)
                          .local()
                          .format("DD-MM-YYYY HH:mm")}
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
                        {moment(params.value)
                          .local()
                          .format("DD-MM-YYYY HH:mm")}
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
                onChange={handleChangePagination}
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
