"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { DataGrid } from "@mui/x-data-grid";
import { AuthService } from "../utils/services/auth.service";
import { toastMessage } from "../component/toasttify";
import { Checkbox, Pagination } from "@mui/material";
import Loader from "../component/loader";
import moment from "moment";
import Loading from "../loading";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import _ from "lodash";
interface UserData {
  fullname?: string;
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

  const [isAllRole, setAllRole] = React.useState([]);

  const [inputValue, setInputValue] = React.useState("");

  const [formDataUser, setFormDataUser] = React.useState({
    email: "",
    fullname: "",
    phone: "",
    bod: "",
    roles: "",
    createBy: "",
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

  const getCurrentListUser = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new AuthService();
        const responseApi = await authService.getAllUser({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { data, countUser } = responseApi.data;
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

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
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

  const addUser = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new AuthService();
      const responseApi = await authService.addUser({
        email: formDataUser.email,
        fullname: formDataUser.fullname,
        phone: formDataUser.phone,
        bod: formDataUser.bod,
        roles: formDataUser.roles,
        createBy: dataUser?.fullname,
      });

      if (responseApi.status === 200) {
        const { message } = responseApi.data;
        setLoading(false);
        toastMessage({ message, type: "success" });
        getCurrentListUser({ skip: 0, take: 100 });
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
    dataUser?.fullname,
    formDataUser.bod,
    formDataUser.email,
    formDataUser.fullname,
    formDataUser.phone,
    formDataUser.roles,
    getCurrentListUser,
    logoutUser,
  ]);

  const activeUser = React.useCallback(
    async ({ userId, value }: { userId: string; value: boolean }) => {
      try {
        setLoading(true);
        const authService = new AuthService();
        const responseApi = await authService.activeUser({ userId, value });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({ message, type: "success" });

          const updateData = _.map(isAllDataUser, (user: any) => {
            if (user.id === userId) {
              user.inActive = value;
            }
            return user;
          }) as [];

          setAllDataUser(updateData);
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
    [isAllDataUser, logoutUser]
  );

  const updateUserRole = React.useCallback(
    async ({ userId, roleId }: { userId: string; roleId: string }) => {
      try {
        setLoading(true);
        const authService = new AuthService();
        const responseApi = await authService.updateUserRoles({
          userId,
          roles: roleId,
          modifiedBy: dataUser?.fullname,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({ message, type: "success" });
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
    [dataUser?.fullname, logoutUser]
  );

  const getAllRole = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new AuthService();
      const responseApi = await authService.getAllRole();

      if (responseApi.status === 200) {
        const { data } = responseApi.data;
        setLoading(false);

        const mergedData = _.concat(
          [
            {
              stringId: "",
              objectName: "Roles",
              key: 0,
              value: "Choose a Role",
            },
          ],
          data
        ) as any;

        setAllRole(mergedData);
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
    getAllRole();
  }, [detailUser, getAllRole, getCurrentListUser]);

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

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();

    if (!_.isEmpty(inputValue)) {
      searchUser({ value: inputValue });
    } else {
      toastMessage({ message: "Please input value search...", type: "error" });
    }
  };

  const handleInputChangeAddUser = (e: any) => {
    const { name, value } = e.target;

    setFormDataUser((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitAddUser = (event: any) => {
    event.preventDefault();
    addUser();
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
          <form
            className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col"
            action="#"
            method="POST"
            onSubmit={handleSubmitAddUser}
          >
            <h6 className="text-black">User Baru</h6>

            <div>
              <label
                htmlFor="fullname"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Fullname
              </label>
              <div className="mt-2">
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  onChange={handleInputChangeAddUser}
                  placeholder="Please input fullname."
                  required
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  placeholder="Please input email. example@mail.com"
                  type="email"
                  required
                  onChange={handleInputChangeAddUser}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="flex flex-row gap-5 flex-wrap items-center">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  No Hp.
                </label>
                <div className="mt-2">
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    required
                    placeholder="contoh +628167222222..."
                    onChange={handleInputChangeAddUser}
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="bod"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Tanggal lahir
                </label>
                <div className="mt-2">
                  <input
                    id="bod"
                    name="bod"
                    type="date"
                    required
                    onChange={handleInputChangeAddUser}
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="Roles"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Roles
                </label>
                <div className="mt-2">
                  <select
                    id="roles"
                    name="roles"
                    className="block w-40 text-white rounded-lg border dark:border-none dark:bg-red-700 bg-red-700 p-2 text-sm focus:border-white-400 focus:outline-none focus:ring-1 focus:ring-white-400"
                    onChange={handleInputChangeAddUser}
                    required
                  >
                    {_.map(isAllRole, (_item: any, index: number) => (
                      <option key={index.toString()} value={_item.stringId}>
                        {_item.value}
                      </option>
                    ))}
                  </select>
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
              getRowHeight={() => "auto"}
              rowSelection={false}
              rows={isAllDataUser}
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
                      <Checkbox
                        checked={params.value}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          event.stopPropagation();
                          activeUser({
                            userId: params.id.toString(),
                            value: event.target.checked,
                          });
                        }}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                    );
                  },
                },
                {
                  field: "fullname",
                  headerName: "Nama Lengkap",
                  minWidth: 150,
                  align: "left",
                  headerAlign: "center",
                  editable: false,
                },
                {
                  field: "email",
                  headerName: "Email",
                  minWidth: 150,
                  headerAlign: "center",
                  editable: false,
                },
                {
                  field: "phone",
                  headerName: "No. HP",
                  minWidth: 150,
                  headerAlign: "center",
                  editable: false,
                },
                {
                  field: "dateOfBirth",
                  headerName: "Tanggal Lahir",
                  minWidth: 150,
                  headerAlign: "center",
                  editable: false,
                },

                {
                  field: "verification",
                  headerName: "Verifikasi",
                  minWidth: 150,
                  headerAlign: "center",
                  editable: false,
                },
                {
                  field: "roleId",
                  headerName: "Roles",
                  minWidth: 200,
                  align: "center",
                  headerAlign: "center",
                  hideSortIcons: true,
                  disableColumnMenu: true,
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

                            const { value } = e.target;

                            updateUserRole({
                              userId: params.id.toString(),
                              roleId: value,
                            });
                          }}
                        >
                          {_.map(isAllRole, (_item: any, index: number) => (
                            <option
                              hidden={_.isEmpty(_item.stringId) ? true : false}
                              key={index.toString()}
                              value={_item.stringId}
                            >
                              {_item.value}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  },
                },
                {
                  field: "createBy",
                  headerName: "Create By",
                  minWidth: 150,
                  editable: false,
                },
                {
                  field: "createdAt",
                  headerName: "Created At",
                  headerAlign: "center",
                  minWidth: 150,
                  editable: false,
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
                  headerAlign: "center",
                  minWidth: 150,
                  editable: false,
                },
                {
                  field: "modifedAt",
                  headerName: "Modifed At",
                  headerAlign: "center",
                  minWidth: 150,
                  editable: false,
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
