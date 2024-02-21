"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import {
  Checkbox,
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Pagination,
  Select,
  TextField,
} from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { customTheme } from "@/app/component/theme";
import { DataGrid } from "@mui/x-data-grid";
import _ from "lodash";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import Loader from "@/app/component/loader";
import Loading from "@/app/loading";
import moment from "moment";
import Search from "@/app/component/search";

export default function Home() {
  const router = useRouter();
  const outerTheme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState<boolean>(false);
  const [addRoleOpen, setAddRoleOpen] = React.useState<boolean>(false);
  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);
  const [listUser, setListUser] = React.useState<any[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const [userId, setUserId] = React.useState<string>("");
  const [inputUser, setInputUser] = React.useState<any>({
    email: undefined,
    fullname: undefined,
    phone: undefined,
    bod: undefined,
    leader: undefined,
    createBy: undefined,
  });

  const [inputEditUser, setInputEditUser] = React.useState<any>({
    email: undefined,
    fullname: undefined,
    phone: undefined,
    dateOfBirth: undefined,
    leader: undefined,
    modifiedBy: undefined,
  });
  const [isRoles, setIsRoles] = React.useState<any[]>([]);
  const [isUserRoles, setUserRoles] = React.useState<any[]>([]);
  const [inputRolesUser, setInputRolesUser] = React.useState<string>("");
  const [isSelectRoles, setSelectRoles] = React.useState<any[]>([]);

  const open = React.useCallback(() => {
    isMenuOpen(!menuOpen);
  }, [menuOpen]);

  const logoutUser = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new Services();
      const responseApi = await authService.logoutUser();

      if (responseApi.status === 200) {
        const { message } = responseApi.data;
        setLoading(false);
        router.replace("/");
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
      } else {
        toastMessage({ message: e.message, type: "error" });
      }
    }
  }, [router]);

  const getAllUser = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getUser({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allUser, countUser } = responseApi.data;
          setLoading(false);
          setListUser(allUser);
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

  const getPageData = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getPageUserData({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allUser, countUser, userDetail, allRoles } = responseApi.data;
          setLoading(false);
          setListUser(allUser);
          setTotalPage(Math.ceil(countUser / 100));
          setDetailUsers(userDetail);
          setIsRoles(allRoles);
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

  const addUser = React.useCallback(
    async ({
      email,
      fullname,
      bod,
      phone,
      leader,
      createdBy,
    }: {
      email: string;
      fullname: string;
      bod: string;
      phone: string;
      leader?: string;
      createdBy: string;
    }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.addUser({
          email,
          fullname,
          bod,
          phone,
          leader,
          createdBy,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          getAllUser({ skip: 0, take: 100 });
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
    [getAllUser, logoutUser]
  );

  const editUser = React.useCallback(
    async ({
      userId,
      email,
      fullname,
      bod,
      phone,
      leader,
      modifiedBy,
    }: {
      userId: string;
      email: string;
      fullname: string;
      bod: string;
      phone: string;
      leader?: string;
      modifiedBy: string;
    }) => {
      try {
        setLoading(true);
        const authService = new Services();

        const responseApi = await authService.editUser({
          userId,
          email,
          fullname,
          bod,
          phone,
          leader,
          modifiedBy,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          getAllUser({ skip: 0, take: 100 });
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
    [getAllUser, logoutUser]
  );

  const deletRoleUser = React.useCallback(
    async ({ userId, roles }: { userId: string; roles: any[] }) => {
      try {
        setLoading(true);
        const authService = new Services();

        const responseApi = await authService.deleteRoles({
          userId,
          roles,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          getAllUser({ skip: 0, take: 100 });
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
    [getAllUser, logoutUser]
  );

  const addRoleUser = React.useCallback(
    async ({ userId, stringId }: { userId: string; stringId: string }) => {
      try {
        setLoading(true);
        const authService = new Services();

        const responseApi = await authService.addRoles({
          userId,
          stringId,
          createdBy: detailUsers.fullname,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          getAllUser({ skip: 0, take: 100 });
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
    [detailUsers?.fullname, getAllUser, logoutUser]
  );

  const activeUser = React.useCallback(
    async ({ userId, value }: { userId: string; value: boolean }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.activeUser({
          userId,
          value,
          modifiedBy: detailUsers?.fullname,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({ message, type: "success" });
          getAllUser({ skip: 0, take: 100 });
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
    [detailUsers?.fullname, getAllUser, logoutUser]
  );

  const searchUser = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.searchUser({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setListUser(data);
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
    getPageData({ skip: 0, take: 100 });
  }, [getPageData]);

  const handleInputChangeUser = (e: any) => {
    const { name, value } = e.target;

    setInputUser((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitUser = (event: any) => {
    event.preventDefault();

    addUser({
      email: inputUser.email,
      fullname: inputUser.fullname,
      bod: inputUser.bod,
      phone: inputUser.phone,
      createdBy: detailUsers.fullname,
      leader: inputUser.leader,
    });
  };

  const handleInputChangeEditUser = (e: any) => {
    const { name, value } = e.target;

    setInputEditUser((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleChangeRoles = (event: any) => {
    const {
      target: { value },
    } = event;
    setInputRolesUser(value);
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
              onSubmit={handleSubmitUser}
            >
              <h6 className="text-black font-bold">Create User</h6>

              <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
                <TextField
                  name="fullname"
                  id="fullname"
                  label="Fullname"
                  type={"text"}
                  size="small"
                  placeholder="Nama Lengkap"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeUser}
                />

                <TextField
                  name="email"
                  id="email"
                  label="email"
                  type={"email"}
                  size="small"
                  required
                  placeholder="xxx@example.com"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeUser}
                />

                <TextField
                  name="phone"
                  id="phone"
                  label="No. HP"
                  type={"text"}
                  size="small"
                  placeholder="+62xx"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeUser}
                />

                <TextField
                  name="bod"
                  id="bod"
                  label="Tanggal lahir"
                  type={"date"}
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeUser}
                />

                <TextField
                  name="leader"
                  id="leader"
                  label="Atasan/Leader"
                  type={"text"}
                  size="small"
                  placeholder="Optional"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeUser}
                />
              </div>

              <button
                type="submit"
                className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Create
              </button>
            </form>

            <div className="m-10 flex flex-col">
              <Search
                onSearch={({ value }) => {
                  searchUser({ value });
                }}
              />

              <div className="w-auto h-[700px]">
                <DataGrid
                  pagination={true}
                  getRowHeight={() => "auto"}
                  rowSelection={false}
                  rows={listUser}
                  columns={[
                    {
                      field: "actions",
                      headerName: "Actions",
                      hideSortIcons: true,
                      disableColumnMenu: true,
                      minWidth: 325,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                      renderCell: (params) => {
                        return (
                          <div className="grid grid-cols-2 gap-2 my-2 place-content-center place-items-center">
                            <button
                              type="button"
                              className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                              onClick={(e: any) => {
                                e.preventDefault();

                                const findId = _.find(listUser, {
                                  id: params.id,
                                });
                                setInputEditUser(findId);

                                setEditOpen(true);
                                setUserId(params.id.toString());
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                              onClick={(e: any) => {
                                e.preventDefault();

                                const findId = _.find(listUser, {
                                  id: params.id,
                                });

                                const finalResult = _.map(
                                  findId.roles,
                                  (item) => {
                                    return Object.assign(
                                      {
                                        id: item.roleId,
                                      },
                                      _.omit(item, "roleId")
                                    );
                                  }
                                );

                                setAddRoleOpen(true);
                                setUserId(params.id.toString());
                                setUserRoles(finalResult);
                              }}
                            >
                              Role
                            </button>
                          </div>
                        );
                      },
                    },
                    {
                      field: "fullname",
                      headerName: "Nama Lengkap",
                      minWidth: 250,
                      align: "left",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "email",
                      headerName: "Email",
                      minWidth: 250,
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "phone",
                      headerName: "No. HP",
                      minWidth: 250,
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "dateOfBirth",
                      headerName: "Tanggal Lahir",
                      minWidth: 250,
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "leader",
                      headerName: "Leader / Atasan",
                      minWidth: 250,
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "roles",
                      headerName: "Roles",
                      headerAlign: "center",
                      minWidth: 250,
                      editable: false,
                      renderCell: (params) => {
                        return (
                          <span className="text-black">
                            {_.map(params.value, (item) => item.value).join(
                              ","
                            )}
                          </span>
                        );
                      },
                    },
                    {
                      field: "inActive",
                      headerName: "In Active",
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
                      valueFormatter: (params) =>
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
                      valueFormatter: (params) =>
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
                    getAllUser({
                      skip: Math.max(0, (value - 1) * 100),
                      take: 100,
                    });
                  }}
                  shape="rounded"
                />
              </div>
            </div>
          </div>

          <Dialog
            open={editOpen}
            onClose={() => {
              setEditOpen(false);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
              component: "form",
              onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();

                editUser({
                  userId: userId,
                  email: inputEditUser.email,
                  fullname: inputEditUser.fullname,
                  bod: moment(inputEditUser.dateOfBirth, "YYYY-MM-DD").format(
                    "DD-MM-YYYY"
                  ),
                  phone: inputEditUser.phone,
                  modifiedBy: detailUsers.fullname,
                  leader: inputEditUser.leader,
                });
                setEditOpen(false);
              },
            }}
          >
            <DialogContent className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
              <h6 className="text-black text-bold text-lg text-center">
                <strong>Edit User</strong>
              </h6>

              <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
                <TextField
                  name="fullname"
                  id="fullname"
                  label="Fullname"
                  type={"text"}
                  size="small"
                  placeholder="Nama Lengkap"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  value={inputEditUser.fullname}
                  onChange={handleInputChangeEditUser}
                />

                <TextField
                  name="email"
                  id="email"
                  label="email"
                  type={"email"}
                  size="small"
                  required
                  placeholder="xxx@example.com"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  value={inputEditUser.email}
                  onChange={handleInputChangeEditUser}
                />

                <TextField
                  name="phone"
                  id="phone"
                  label="No. HP"
                  type={"text"}
                  size="small"
                  placeholder="+62xx"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  value={inputEditUser.phone}
                  onChange={handleInputChangeEditUser}
                />

                <TextField
                  name="dateOfBirth"
                  id="dateOfBirth"
                  label="Tanggal lahir"
                  type={"date"}
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  value={moment(inputEditUser.dateOfBirth, "DD-MM-YYYY").format(
                    "YYYY-MM-DD"
                  )}
                  onChange={handleInputChangeEditUser}
                />

                <TextField
                  name="leader"
                  id="leader"
                  label="Atasan/Leader"
                  type={"text"}
                  size="small"
                  placeholder="Optional"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  value={inputEditUser.leader ? inputEditUser.leader : ""}
                  onChange={handleInputChangeEditUser}
                />
              </div>

              <button
                type="submit"
                className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:bg-red-300"
              >
                Simpan
              </button>
            </DialogContent>
          </Dialog>

          <Dialog
            open={addRoleOpen}
            onClose={() => {
              setAddRoleOpen(false);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
              component: "form",
              onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                addRoleUser({ userId, stringId: inputRolesUser });
                setInputRolesUser("");
                setAddRoleOpen(false);
              },
            }}
          >
            <DialogContent className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
              <h6 className="text-black text-bold text-lg text-center">
                <strong>Roles</strong>
              </h6>

              <div className="flex flex-row items-center gap-3">
                <FormControl
                  fullWidth
                  sx={{ m: 1, minWidth: 120, maxWidth: 220 }}
                >
                  <InputLabel id="roles-label">Roles</InputLabel>
                  <Select
                    labelId="roles-label"
                    id="roles-label"
                    label="Roles"
                    value={inputRolesUser}
                    onChange={handleChangeRoles}
                    input={<OutlinedInput label="Name" />}
                  >
                    {isRoles.map((item: any, i: number) => (
                      <MenuItem key={i.toString()} value={item.stringId}>
                        {item.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <button
                  type="submit"
                  className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:bg-red-300"
                >
                  Simpan
                </button>
              </div>

              <div className="w-auto h-[200px]">
                <DataGrid
                  pagination={true}
                  getRowHeight={() => "auto"}
                  rows={isUserRoles}
                  checkboxSelection
                  onRowSelectionModelChange={(ids: any) => {
                    const arrayId = _.split(ids, ",");
                    const filteredData = _.filter(isUserRoles, (item: any) =>
                      arrayId.includes(item.id)
                    );

                    setSelectRoles(filteredData);
                  }}
                  slots={{
                    toolbar: () => (
                      <button
                        onClick={(e: any) => {
                          e.preventDefault();
                          deletRoleUser({ userId, roles: isSelectRoles });
                          setAddRoleOpen(false);
                          setSelectRoles([]);
                        }}
                        className={`${
                          !_.isEmpty(isSelectRoles) ? "block" : "hidden"
                        } self-start m-2 justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700`}
                      >
                        Delete Roles
                      </button>
                    ),
                  }}
                  columns={[
                    {
                      field: "value",
                      headerName: "Roles",
                      minWidth: 250,
                      width: 500,
                      align: "left",
                      headerAlign: "center",
                      editable: false,
                    },
                  ]}
                />
              </div>
            </DialogContent>
          </Dialog>
        </Suspense>

        <Loader active={loading} />
      </main>
    </ThemeProvider>
  );
}
