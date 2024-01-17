"use client";

import React, { Suspense } from "react";
import _ from "lodash";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import Loading from "../loading";
import Loader from "../component/loader";
import Select from "react-select";
import QRCode from "react-qr-code";
import Table from "@mui/material/Table";
import { AuthService } from "../utils/services/auth.service";
import { toastMessage } from "../component/toasttify";
import { useReactToPrint } from "react-to-print";
import { ProductService } from "../utils/services/product.service";
import { useRouter } from "next/navigation";
import moment from "moment";
import { Pagination, TableBody, TableCell } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

interface UserData {
  roleId?: {
    key: number;
  };
}

export default function Page() {
  const router = useRouter();
  const componentRef = React.useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [dataUser, setDataUser] = React.useState<UserData | undefined>(
    undefined
  );

  const [isAllDataProduct, setAllDataProduct] = React.useState([]);

  const [formDataProduct, setFormDataProduct] = React.useState({
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

  const [qrCode, setQRCode] = React.useState({
    sku: undefined,
    bestBefore: undefined,
  } as any);

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

  React.useEffect(() => {
    detailUser();
    getAllProduct();
  }, [detailUser, getAllProduct]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    bodyClass: "flex flex-wrap min-h-screen",
    onAfterPrint: () => {
      //alert("status print");
    },
    onPrintError: (error: any) => {
      toastMessage({ message: error.message, type: "error" });
    },
    documentTitle: qrCode
      ? `${qrCode.sku} ${moment().format("DD-MM-YYYY HH:mm:ss")}`
      : "",
    removeAfterPrint: true,
    pageStyle: `
      @page {
        size: 25mm 15mm;
        margin: 1mm;
      }

      @media all {
        .page-break {
          display: none;
        }
      }
      
      @media print {
        .page-break {
          display: block;
          page-break-before: always;
        }
      }

      div.parent {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      div.parent p { 
        color:black; 
        font-size: 5px; 
      }
      div.parent p.code { 
        color:black; 
        font-size: 5px; 
        font-weight: bold; 
      }
      div.container-print {
        display: flex;
        flex-direction: row;
        gap: 1px;
      }
      div.container-body {
        display: flex; 
        flex-direction: column; 
      }
      .qrCode {
        height: 40px; 
        width: 40px;
      }
      .divider {
        border-bottom: 0.2px solid black;
        width: 100%;
        margin-top: 1px; 
        margin-bottom: 1px;
      }
    `,
  });

  const handleChange = (selectedOption: any) => {
    if (selectedOption) {
      findProduct({ productId: selectedOption.value });
    }
  };

  const handleInputChangeProduct = (e: any) => {
    const { name, value } = e.target;

    setFormDataProduct((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleGenerateQRCode = (event: any) => {
    event.preventDefault();

    const { productCode, expiredPeriod } = formDataProduct;

    setQRCode({
      sku: `SBI${moment().format("YYMMDD")}${productCode}${
        Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
      }`,
      bestBefore: moment(new Date())
        .add(expiredPeriod, "days")
        .format("DD/MM/YYYY"),
    });
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
          <div className="grid grid-cols-1 gap-5 place-content-center place-items-start md:grid-cols-2">
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
                  Generate
                </button>
              </div>
            </form>

            <div className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col my-5">
              <h6 className="text-black text-bold">
                <strong>QR-Code Product</strong>
              </h6>

              {qrCode.sku ? (
                <div className="gap-3 flex flex-col">
                  <div ref={componentRef} className="hidden container-body">
                    <div className="container-print">
                      <QRCode value={qrCode.sku} level="H" className="qrCode" />
                      <div className="parent">
                        <p className="code">{qrCode.sku}</p>
                        <div className="divider" />
                        <p>Best Before.</p>
                        <p>{qrCode.bestBefore}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row gap-2">
                    <QRCode
                      value={qrCode.sku}
                      level="H"
                      className="w-[150px] h-[150px]"
                    />
                    <div className="flex flex-col gap-2">
                      <p className="text-black text-xl font-bold">
                        {qrCode.sku}
                      </p>
                      <div className="border-b-[5px] border-black" />
                      <p className="text-black text-md">Best Before.</p>
                      <p className="text-black text-md">{qrCode.bestBefore}</p>
                    </div>
                  </div>
                  <button
                    className={`justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700`}
                    onClick={handlePrint}
                  >
                    Print this out!
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="h-[450px] m-10">
            <DataGrid
              pagination={true}
              autoHeight
              rows={[]}
              columns={[]}
              rowSelection={false}
            />

            <div className="flex justify-center py-4">
              <Pagination count={1} page={1} shape="rounded" />
            </div>
          </div>
        </div>
      </Suspense>

      <Loader active={loading} />
    </main>
  );
}
