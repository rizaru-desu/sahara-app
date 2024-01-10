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
import { IconButton, Pagination } from "@mui/material";
import { CustomerService } from "../utils/services/customer.service";
import { FaInstagram, FaFacebook, FaShopify } from "react-icons/fa";

interface UserData {
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

  const [isTotalPage, setTotalPage] = React.useState(0);
  const [isCurrentPage, setCurrentPage] = React.useState(1);
  const [isAllDataCustomer, setAllDataCustomer] = React.useState([]);

  const [inputValue, setInputValue] = React.useState("");

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
      setLoading(true);
      const authService = new AuthService();
      const responseApi = await authService.userDetail();

      const { result, data } = responseApi.data;
      if (result === "OK") {
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

  const getCurrentListCustomer = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const customerService = new CustomerService();
        const responseApi = await customerService.getCustomer({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { data, countUser } = responseApi.data;
          setLoading(false);
          setAllDataCustomer(data);
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

  const searchCustomer = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const customerService = new CustomerService();

        const responseApi = await customerService.searchCustomer({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setAllDataCustomer(data);
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
    getCurrentListCustomer({ skip: 0, take: 100 });
  }, [detailUser, getCurrentListCustomer]);

  const handleChange = async (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
    getCurrentListCustomer({ skip: Math.max(0, (value - 1) * 100), take: 100 });
  };

  const handleInputSearchChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleSubmitSearch = (event: any) => {
    event.preventDefault();

    if (!_.isEmpty(inputValue)) {
      searchCustomer({ value: inputValue });
    } else {
      toastMessage({ message: "Please input value search...", type: "error" });
    }
  };

  return (
    <main className="dark:bg-white bg-white min-h-screen">
      <SideBar opens={menuOpen} closeds={open} roles={dataUser?.roleId?.key} />
      <NavBar
        items={{ label: "Customer", link: "#" }}
        opens={open}
        data={dataUser}
      />

      <Suspense fallback={<Loading />}>
        <div className="p-4 xl:ml-80 gap-5">
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
                  placeholder="Search Nama usaha / Merek Usaha..."
                  className="block w-[280px] text-black placeholder:text-black rounded-lg dark:border-red-700 border-2 py-2 pl-10 pr-4 text-sm focus:border-red-900 focus:outline-none focus:ring-1 focus:ring-red-900"
                  minLength={3}
                  onChange={handleInputSearchChange}
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
              rows={isAllDataCustomer}
              columns={[
                {
                  field: "namaUsaha",
                  headerName: "Nama Usaha",
                  minWidth: 150,
                  align: "left",
                  headerAlign: "center",
                },
                {
                  field: "merekUsaha",
                  headerName: "Nama Merek",
                  minWidth: 150,
                  align: "left",
                  headerAlign: "center",
                },
                {
                  field: "lamaUsaha",
                  headerName: "Lama Usaha (Bulan)",
                  minWidth: 150,
                  align: "center",
                  headerAlign: "center",
                },
                {
                  field: "jumlahBooth",
                  headerName: "Total Booth",
                  minWidth: 150,
                  align: "center",
                  headerAlign: "center",
                  hideSortIcons: true,
                  disableColumnMenu: true,
                  renderCell: (params) => {
                    const onClick = (e: any) => {
                      e.stopPropagation(); // don't select this row after clicking

                      router.push(`/customer/booth/${params.id}`);
                    };
                    return (
                      <button onClick={onClick}>
                        <span className="text-blue-700">{params.value}</span>
                      </button>
                    );
                  },
                },
                {
                  field: "instagram",
                  headerName: "instagram",
                  minWidth: 150,
                  align: "center",
                  headerAlign: "center",
                  hideSortIcons: true,
                  disableColumnMenu: true,
                  renderCell: (params) => {
                    return (
                      <IconButton
                        aria-label="delete"
                        href={params.value}
                        target="_blank"
                      >
                        <FaInstagram color="#2D3250" size={20} />
                      </IconButton>
                    );
                  },
                },
                {
                  field: "facebook",
                  headerName: "facebook",
                  minWidth: 150,
                  align: "center",
                  headerAlign: "center",
                  hideSortIcons: true,
                  disableColumnMenu: true,
                  renderCell: (params) => {
                    return (
                      <IconButton
                        aria-label="delete"
                        href={params.value}
                        target="_blank"
                      >
                        <FaFacebook color="#2D3250" size={20} />
                      </IconButton>
                    );
                  },
                },
                {
                  field: "ecommerce",
                  headerName: "ecommerce",
                  minWidth: 150,
                  align: "center",
                  headerAlign: "center",
                  hideSortIcons: true,
                  disableColumnMenu: true,
                  renderCell: (params) => {
                    return (
                      <IconButton
                        aria-label="delete"
                        href={params.value}
                        target="_blank"
                      >
                        <FaShopify color="#2D3250" size={20} />
                      </IconButton>
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
