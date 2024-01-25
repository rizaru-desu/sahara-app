"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { DataGrid } from "@mui/x-data-grid";
import { AuthService } from "../utils/services/auth.service";
import { toastMessage } from "../component/toasttify";
import { IconButton, Pagination } from "@mui/material";
import { CustomerService } from "../utils/services/agent.service";
import {
  FaInstagram,
  FaFacebook,
  FaShopify,
  FaPersonBooth,
  FaEdit,
} from "react-icons/fa";
import moment from "moment";
import _ from "lodash";
import Loader from "../component/loader";
import Loading from "../loading";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";

interface UserData {
  fullname: string;
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

  const [formData, setFormData] = React.useState({
    namaUsaha: "",
    namaMerek: "",
    lamaUsaha: 0,
    totalBooth: 0,
    instagram: undefined,
    facebook: undefined,
    ecommerce: undefined,
  });

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

  const getCurrentListAgent = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const customerService = new CustomerService();
        const responseApi = await customerService.getAgent({
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

  const searchAgent = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const customerService = new CustomerService();

        const responseApi = await customerService.searchAgent({
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

  const addAgent = React.useCallback(
    async ({
      namaUsaha,
      namaMerek,
      lamaUsaha,
      totalBooth,
      instagram,
      facebook,
      ecommerce,
    }: {
      namaUsaha: string;
      namaMerek: string;
      lamaUsaha: number;
      totalBooth: number;
      instagram?: string;
      facebook?: string;
      ecommerce?: string;
    }) => {
      try {
        setLoading(true);
        const customerService = new CustomerService();

        const responseApi = await customerService.addAgent({
          namaUsaha,
          namaMerek,
          lamaUsaha,
          totalBooth,
          instagram,
          facebook,
          ecommerce,
          createBy: dataUser?.fullname,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);

          toastMessage({
            message: message,
            type: "success",
          });
          getCurrentListAgent({ skip: 0, take: 100 });
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
    [dataUser?.fullname, getCurrentListAgent, logoutUser]
  );

  React.useEffect(() => {
    detailUser();
    getCurrentListAgent({ skip: 0, take: 100 });
  }, [detailUser, getCurrentListAgent]);

  const handleChange = async (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
    getCurrentListAgent({ skip: Math.max(0, (value - 1) * 100), take: 100 });
  };

  const handleInputSearchChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleSubmitSearch = (event: any) => {
    event.preventDefault();

    if (!_.isEmpty(inputValue)) {
      searchAgent({ value: inputValue });
    } else {
      toastMessage({ message: "Please input value search...", type: "error" });
    }
  };

  const handleInputChangeCustomer = (e: any) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitAddCustomer = (event: any) => {
    event.preventDefault();

    const {
      namaUsaha,
      namaMerek,
      lamaUsaha,
      totalBooth,
      instagram,
      facebook,
      ecommerce,
    } = formData;

    addAgent({
      namaUsaha,
      namaMerek,
      lamaUsaha,
      totalBooth,
      instagram,
      facebook,
      ecommerce,
    });
  };

  return (
    <main className="dark:bg-white bg-white min-h-screen">
      <SideBar opens={menuOpen} closeds={open} roles={dataUser?.roleId?.key} />
      <NavBar
        items={{ label: "Agent", link: "#" }}
        opens={open}
        data={dataUser}
      />

      <Suspense fallback={<Loading />}>
        <div className="p-4 xl:ml-80 gap-5">
          <form
            className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col"
            onSubmit={handleSubmitAddCustomer}
          >
            <h6 className="text-black text-bold">
              <strong>Add Agent</strong>
            </h6>

            <div className="grid grid-cols-2 grid-rows-4 place-content-evenly gap-3">
              <div>
                <label
                  htmlFor="namaUsaha"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nama Pengusaha
                </label>
                <div className="mt-2">
                  <input
                    id="namaUsaha"
                    name="namaUsaha"
                    type="text"
                    required
                    placeholder="example: PT. ..../CV. ..../etc"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    onChange={handleInputChangeCustomer}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="namaMerek"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nama Merek
                </label>
                <div className="mt-2">
                  <input
                    id="namaMerek"
                    name="namaMerek"
                    type="text"
                    required
                    placeholder="example: Kebab Enak/etc"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    onChange={handleInputChangeCustomer}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lamaUsaha"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Lama Usaha (Bulan)
                </label>
                <div className="mt-2">
                  <input
                    id="lamaUsaha"
                    name="lamaUsaha"
                    type="number"
                    min={0}
                    required
                    placeholder="example: 10 bulan"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    onChange={handleInputChangeCustomer}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="totalBooth"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Total Booth
                </label>
                <div className="mt-2">
                  <input
                    id="totalBooth"
                    name="totalBooth"
                    type="number"
                    min={0}
                    required
                    placeholder="example: 10"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    onChange={handleInputChangeCustomer}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="instagram"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Instagram
                </label>
                <div className="mt-2">
                  <input
                    id="instagram"
                    name="instagram"
                    type="text"
                    placeholder="Url: https://www.instagram.com/kebab.official"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    onChange={handleInputChangeCustomer}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="facebook"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  facebok
                </label>
                <div className="mt-2">
                  <input
                    id="facebook"
                    name="facebook"
                    type="text"
                    placeholder="Url: https://www.facebook.com/kebab.official"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    onChange={handleInputChangeCustomer}
                  />
                </div>
              </div>

              <div className="col-span-2 place-self-center">
                <label
                  htmlFor="ecommerce"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  e-commerce
                </label>
                <div className="mt-2">
                  <input
                    id="ecommerce"
                    name="ecommerce"
                    type="text"
                    placeholder="Url E-Commerce"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    onChange={handleInputChangeCustomer}
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
                  field: "inActive",
                  headerName: "Active",
                  type: "actions",
                  minWidth: 100,
                  align: "center",
                  headerAlign: "center",
                  hideSortIcons: true,
                  disableColumnMenu: true,
                  renderCell: (params) => {
                    return (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/agent/${params.id}`);
                        }}
                      >
                        <FaEdit size={20} />
                      </button>
                    );
                  },
                },
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
                },
                {
                  field: "instagram",
                  headerName: "Instagram",
                  minWidth: 150,
                  align: "center",
                  headerAlign: "center",
                  hideSortIcons: true,
                  disableColumnMenu: true,
                  renderCell: (params) => {
                    if (params.value === null) {
                      return <span className="text-black">Empty</span>;
                    }
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
                  headerName: "Facebook",
                  minWidth: 150,
                  align: "center",
                  headerAlign: "center",
                  hideSortIcons: true,
                  disableColumnMenu: true,
                  renderCell: (params) => {
                    if (params.value === null) {
                      return <span className="text-black">Empty</span>;
                    }
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
                  headerName: "E-Commerce",
                  minWidth: 150,
                  align: "center",
                  headerAlign: "center",
                  hideSortIcons: true,
                  disableColumnMenu: true,
                  renderCell: (params) => {
                    if (params.value === null) {
                      return <span className="text-black">Empty</span>;
                    }
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
