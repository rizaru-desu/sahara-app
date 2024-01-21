"use client";

import "photoviewer/dist/photoviewer.css";
import React, { Suspense } from "react";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { CustomerService } from "@/app/utils/services/customer.service";
import { DataGrid } from "@mui/x-data-grid";
import { AuthService } from "@/app/utils/services/auth.service";
import { toastMessage } from "@/app/component/toasttify";
import { Pagination } from "@mui/material";
import { ProductService } from "@/app/utils/services/product.service";

import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";

import Loading from "@/app/loading";
import Loader from "@/app/component/loader";
import moment from "moment";
import PhotoViewer from "photoviewer";

interface UserData {
  fullname?: string;
  roleId?: {
    key: number;
  };
}

export default function Booth({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [dataUser, setDataUser] = React.useState<UserData | undefined>(
    undefined
  );

  const [isTotalPage, setTotalPage] = React.useState(0);
  const [isCurrentPage, setCurrentPage] = React.useState(1);
  const [isAllDataBooth, setAllDataBooth] = React.useState([]);

  const [formData, setFormData] = React.useState({
    alamatBooth: "",
    photoBooth: null,
  });

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

  const getCurrentListBooth = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const customerService = new CustomerService();
        const responseApi = await customerService.getBooth({
          skip,
          take,
          customerId: params.id,
        });

        if (responseApi.status === 200) {
          const { data, countUser } = responseApi.data;
          setLoading(false);
          setAllDataBooth(data);
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
    [logoutUser, params.id]
  );

  const searchBooth = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const customerService = new CustomerService();

        const responseApi = await customerService.searchBooth({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setAllDataBooth(data);
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
    getCurrentListBooth({ skip: 0, take: 100 });
  }, [detailUser, getCurrentListBooth]);

  const handleChange = async (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
    getCurrentListBooth({ skip: Math.max(0, (value - 1) * 100), take: 100 });
  };

  const handleInputSearchChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleSubmitSearch = (event: any) => {
    event.preventDefault();

    if (!_.isEmpty(inputValue)) {
      searchBooth({ value: inputValue });
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
          <form className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
            <h6 className="text-black text-bold">
              <strong>Add Booth</strong>
            </h6>

            <div className="grid grid-cols-2 place-content-evenly gap-3">
              <div>
                <label
                  htmlFor="namaUsaha"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Alamat Booth
                </label>
                <div className="mt-2">
                  <input
                    id="alamatBooth"
                    name="alamatBooth"
                    type="text"
                    required
                    placeholder="example: Jl. Srilanke ..."
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="namaMerek"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Photo
                </label>
                <div className="mt-2">
                  <input
                    id="photoBooth"
                    name="photoBooth"
                    type="file"
                    required
                    accept=".jpeg,.jpg"
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
                  onChange={handleInputSearchChange}
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
              rowSelection={false}
              getRowHeight={() => "auto"}
              rows={isAllDataBooth}
              columns={[
                {
                  field: "alamatBooth",
                  headerName: "Alamat Booth",
                  minWidth: 150,
                  width: 500,
                  align: "left",
                  headerAlign: "center",
                },
                {
                  field: "photo",
                  headerName: "Photo",
                  minWidth: 150,
                  align: "center",
                  headerAlign: "center",
                  hideSortIcons: true,
                  disableColumnMenu: true,
                  renderCell: (params) => {
                    const onClick = (e: any) => {
                      e.stopPropagation(); // don't select this row after clicking
                      /* new PhotoViewer([{ src: params.value, title: "" }], {
                        index: 0,
                        title: false,
                      }); */
                    };

                    return (
                      <button className="m-4" onClick={onClick}>
                        <img
                          src={params.value}
                          className="mx-auto h-40 w-40 object-cover"
                          loading="lazy"
                        />
                      </button>
                    );
                  },
                },
                {
                  field: "createBy",
                  headerName: "Create By",
                  minWidth: 150,
                  align: "left",
                  headerAlign: "center",
                },
                {
                  field: "modifiedBy",
                  headerName: "Modified By",
                  minWidth: 150,
                  align: "left",
                  headerAlign: "center",
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
