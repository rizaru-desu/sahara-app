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
import moment from "moment";
import { FaTrash } from "react-icons/fa";
import { Pagination } from "@mui/material";

interface UserData {
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
  const [isTotalPage, setTotalPage] = React.useState(0);
  const [isCurrentPage, setCurrentPage] = React.useState(1);
  const [isAllDataUser, setAllDataUser] = React.useState([]);

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

  const getCurrentListUser = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new AuthService();
        const responseApi = await authService.getAllUser({
          skip,
          take,
        });

        const { result, data, countUser } = responseApi.data;
        if (result === "OK") {
          setLoading(false);
          setAllDataUser(data);
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

  const searchUser = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const authService = new AuthService();
        const responseApi = await authService.searchUser({
          value,
        });

        const { result, data, countUser } = responseApi.data;
        if (result === "OK") {
          setLoading(false);
          setAllDataUser(data);
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

  React.useEffect(() => {
    detailUser();
    getCurrentListUser({ skip: 0, take: 100 });
  }, [detailUser, getCurrentListUser]);

  const handleChange = async (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
    getCurrentListUser({
      skip: Math.max(0, (value - 1) * 100),
      take: 100,
    });
  };

  // Event handler to update the state when the input changes
  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  // Event handler to handle form submission (if needed)
  const handleSubmit = (event: any) => {
    event.preventDefault();

    if (!_.isEmpty(inputValue)) {
      searchUser({ value: inputValue });
    } else {
      toastMessage({ message: "Please input value search...", type: "error" });
    }
  };

  return (
    <main className="dark:bg-white bg-white min-h-screen">
      <SideBar opens={menuOpen} closeds={open} roles={dataUser?.roleId?.key} />
      <NavBar
        items={{ label: "All User", link: "#" }}
        opens={open}
        data={dataUser}
      />

      <Suspense fallback={<Loading />}>
        <div className="p-4 xl:ml-80 gap-5">
          <form className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
            <h6 className="text-black">User Baru</h6>
            <div>
              <label
                htmlFor="kodeProduct"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Fullname
              </label>
              <div className="mt-2">
                <input
                  id="kodeProduct"
                  name="kodeProduct"
                  type="text"
                  placeholder="Please input fullname."
                  required
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="kodeProduct"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                email
              </label>
              <div className="mt-2">
                <input
                  id="kodeProduct"
                  name="kodeProduct"
                  placeholder="Please input email."
                  type="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="flex flex-row gap-5 flex-wrap items-center">
              <div>
                <label
                  htmlFor="kodeProduct"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  No Hp.
                </label>
                <div className="mt-2">
                  <input
                    id="kodeProduct"
                    name="kodeProduct"
                    type="text"
                    required
                    placeholder="contoh +628167222222..."
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="variant"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Tanggal lahir
                </label>
                <div className="mt-2">
                  <input
                    id="variant"
                    name="variant"
                    type="date"
                    required
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="relative float-right block">
                <label htmlFor="inputFilter" className="sr-only">
                  Roles
                </label>
                <select
                  id="inputFilter"
                  className="block w-40 text-white rounded-lg border dark:border-none dark:bg-red-700 bg-red-700 p-2 text-sm focus:border-white-400 focus:outline-none focus:ring-1 focus:ring-white-400"
                  defaultValue={2} // Set the defaultValue here
                >
                  <option value={1}>Administration</option>
                  <option value={2}>User Only</option>
                </select>
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
              onSubmit={handleSubmit}
            >
              <div className="relative mr-5 float-left">
                <label htmlFor="inputSearch" className="sr-only">
                  Search{" "}
                </label>
                <input
                  id="inputSearch"
                  type="text"
                  placeholder="Search Fullname / Email / No. Hp"
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
              rows={isAllDataUser}
              columns={[
                {
                  field: "id",
                  headerName: "Hapus User",
                  minWidth: 150,
                  renderCell: (params) => {
                    const onClick = (e: any) => {
                      e.stopPropagation(); // don't select this row after clicking
                    };

                    return (
                      <button onClick={onClick}>
                        <FaTrash color={"red"} size={25} />
                      </button>
                    );
                  },
                },
                {
                  field: "fullname",
                  headerName: "Nama Lengkap",
                  minWidth: 150,
                },
                {
                  field: "email",
                  headerName: "Email",
                  minWidth: 150,
                },
                {
                  field: "phone",
                  headerName: "No. HP",
                  minWidth: 150,
                },
                {
                  field: "dateOfBirth",
                  headerName: "Tanggal Lahir",
                  minWidth: 150,
                },

                {
                  field: "verification",
                  headerName: "Verifikasi",
                  minWidth: 150,
                },
                {
                  field: "roleId",
                  headerName: "Roles",
                  minWidth: 200,
                  renderCell: (params) => {
                    return (
                      <div className="flex align-middle">
                        <label htmlFor="inputFilter" className="sr-only">
                          Filter
                        </label>
                        <select
                          id="inputFilter"
                          className="block text-black p-2 text-sm bg-transparent focus:ring-transparent hover:border-none"
                          defaultValue={params.value} // Set the defaultValue here
                          onChange={(e) => {
                            e.stopPropagation();
                            alert("change success");
                          }}
                        >
                          <option
                            value={"e8830804-3803-42c6-a3ae-1f3421d5c056"}
                          >
                            ADMINISTRATION
                          </option>
                          <option
                            value={"480663db-e5b7-400d-8485-954dc54686cd"}
                          >
                            USER
                          </option>
                        </select>
                      </div>
                    );
                  },
                },
                {
                  field: "createBy",
                  headerName: "Create By",
                  minWidth: 150,
                },
                {
                  field: "createdAt",
                  headerName: "Created At",
                  minWidth: 150,
                  renderCell: (params) => {
                    return (
                      <span className="text-black">
                        {moment(params.value).format("DD-MM-YYYY hh:mm")}
                      </span>
                    );
                  },
                },
                {
                  field: "modifiedBy",
                  headerName: "Modified By",
                  minWidth: 150,
                },
                {
                  field: "modifedAt",
                  headerName: "Modifed At",
                  minWidth: 150,
                  renderCell: (params) => {
                    return (
                      <span className="text-black">
                        {moment(params.value).format("DD-MM-YYYY hh:mm")}
                      </span>
                    );
                  },
                },
              ]}
              rowSelection={false}
            />
          </div>

          <div className="flex justify-center py-4">
            <Pagination
              count={isTotalPage}
              page={isCurrentPage}
              onChange={handleChange}
              shape="rounded"
            />
          </div>
        </div>
      </Suspense>

      <Loader active={loading} />
    </main>
  );
}
