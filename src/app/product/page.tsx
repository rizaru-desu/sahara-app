"use client";

import React, { Suspense } from "react";
import _ from "lodash";
import { useRouter } from "next/navigation";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import { faker } from "@faker-js/faker";
import { DataGrid } from "@mui/x-data-grid";
import Loading from "../loading";
import { AuthService } from "../utils/services/auth.service";
import { toastMessage } from "../component/toasttify";
import Loader from "../component/loader";

export default function Product() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [dataUser, setDataUser] = React.useState(undefined);

  const open = React.useCallback(() => {
    isMenuOpen(!menuOpen);
  }, [menuOpen]);

  const logoutUser = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new AuthService();
      const responseApi = await authService.logout();

      if (responseApi.data.result === "OK") {
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
      const roles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      setLoading(true);
      const authService = new AuthService();
      const responseApi = await authService.userDetail();

      const { result, data } = responseApi.data;
      if (result === "OK") {
        setLoading(false);
        if (roles.includes(data?.roleId?.key)) {
          setDataUser(responseApi.data.data);
        } else {
          logoutUser();
          toastMessage({ message: "NOT ADMIN!", type: "error" });
        }
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
    detailUser();
  }, [detailUser]);

  const data = generateMeatKebabsWithFaker();

  return (
    <main className="dark:bg-white bg-white min-h-screen">
      <SideBar opens={menuOpen} closeds={open} />
      <NavBar
        items={{ label: "Product", link: "#" }}
        opens={open}
        data={dataUser}
        logout={async () => {
          logoutUser();
        }}
      />

      <Suspense fallback={<Loading />}>
        <div className="p-4 xl:ml-80 gap-5">
          <form className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
            <h6 className="text-black">Produk baru</h6>
            <div>
              <label
                htmlFor="kodeProduct"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Nama Produk
              </label>
              <div className="mt-2">
                <input
                  id="kodeProduct"
                  name="kodeProduct"
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="flex flex-row gap-5 flex-wrap">
              <div>
                <label
                  htmlFor="kodeProduct"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Kode Product
                </label>
                <div className="mt-2">
                  <input
                    id="kodeProduct"
                    name="kodeProduct"
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="variant"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Variant
                </label>
                <div className="mt-2">
                  <input
                    id="variant"
                    name="variant"
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="variant"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Berat
                </label>
                <div className="mt-2 flex flex-row">
                  <input
                    id="variant"
                    name="variant"
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
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
          <div className="h-[450px] m-10 flex flex-col">
            <div className="relative m-[2px] mb-3 mr-5 float-left">
              <label htmlFor="inputSearch" className="sr-only">
                Search{" "}
              </label>
              <input
                id="inputSearch"
                type="text"
                placeholder="Search kode produk / varian / nama produk..."
                className="block w-64 text-black placeholder:text-black rounded-lg dark:border-red-700 border-2 py-2 pl-10 pr-4 text-sm focus:border-red-900 focus:outline-none focus:ring-1 focus:ring-red-900"
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
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </span>
            </div>

            <DataGrid
              pagination={undefined}
              rows={data}
              columns={[
                {
                  field: "productCode",
                  headerName: "Kode Produk",
                  minWidth: 150,
                },
                {
                  field: "productVariant",
                  headerName: "Varian",
                  minWidth: 150,
                },
                {
                  field: "productName",
                  headerName: "Nama Product",
                  minWidth: 150,
                },
                { field: "productWeight", headerName: "Berat", minWidth: 150 },
              ]}
              onRowDoubleClick={(data) => {
                router.push(`/product/${data.id}`);
              }}
            />
          </div>

          <div className="flex justify-center py-4">
            <div className="flex justify-center">
              <nav aria-label="Page navigation example">
                <ul className="flex list-style-none">
                  <li className="page-item disabled">
                    <a
                      className="page-link relative block py-1.5 px-3  border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-500 pointer-events-none focus:shadow-none"
                      href="#"
                      tabIndex={-1}
                      aria-disabled="true"
                    >
                      Previous
                    </a>
                  </li>
                  <li className="page-item active">
                    <a
                      className="page-link relative block py-1.5 px-3 border-0 bg-red-700 outline-none transition-all duration-300 rounded text-white hover:text-white hover:bg-red-700 shadow-md focus:shadow-md"
                      href="#"
                    >
                      1 <span className="visually-hidden"></span>
                    </a>
                  </li>
                  <li className="page-item">
                    <a
                      className="page-link relative block py-1.5 px-3 border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
                      href="#"
                    >
                      3
                    </a>
                  </li>
                  <li className="page-item">
                    <a
                      className="page-link relative block py-1.5 px-3 border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
                      href="#"
                    >
                      3
                    </a>
                  </li>
                  <li className="page-item">
                    <a
                      className="page-link relative block py-1.5 px-3 border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
                      href="#"
                    >
                      Next
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </Suspense>

      <Loader active={loading} />
    </main>
  );
}

function generateMeatKebabsWithFaker() {
  const meatKebabs = [];

  for (let i = 1; i <= 100; i++) {
    meatKebabs.push({
      id: i,
      productCode: faker.string.alphanumeric(4).toUpperCase(),
      productName: `Meat Kebab ${i}`,
      productVariant: faker.commerce.productAdjective(),
      productWeight: `${faker.number.int({ min: 150, max: 250 })}g`,
    });
  }

  return meatKebabs;
}
