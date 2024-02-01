"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import {
  Button,
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
import Search from "@/app/component/search";
import moment from "moment";

interface AgentInput {
  agentId?: string;
  email: string;
  customerName: string;
  picPhone: string;
  picName: string;
  alamatToko: string;
  noNpwp?: string;
  createdBy?: string;
  modifiedBy?: string;
}

export default function Home() {
  const router = useRouter();
  const outerTheme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);
  const [listAgent, setListAgent] = React.useState<any[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const [editOpen, setEditOpen] = React.useState<boolean>(false);
  const [agentInput, setAgentInput] = React.useState<AgentInput>({
    agentId: undefined,
    email: "",
    customerName: "",
    picPhone: "",
    picName: "",
    alamatToko: "",
    noNpwp: undefined,
    createdBy: "",
    modifiedBy: "",
  });
  const [agentEditInput, setAgentEditInput] = React.useState<AgentInput>({
    agentId: undefined,
    email: "",
    customerName: "",
    picPhone: "",
    picName: "",
    alamatToko: "",
    noNpwp: undefined,
    createdBy: "",
    modifiedBy: "",
  });

  const open = React.useCallback(() => {
    isMenuOpen(!menuOpen);
  }, [menuOpen]);

  const logoutUser = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new Services();
      const responseApi = await authService.logoutUser();

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

  const getPageData = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getPageAgentData({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allAgent, countAgent, userDetail } = responseApi.data;
          setLoading(false);
          setListAgent(allAgent);
          setTotalPage(Math.ceil(countAgent / 100));
          setDetailUsers(userDetail);
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

  const getAllAgent = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getAgent({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allAgent, countAgent } = responseApi.data;
          setLoading(false);
          setListAgent(allAgent);
          setTotalPage(Math.ceil(countAgent / 100));
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
        const authService = new Services();
        const responseApi = await authService.searchAgent({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setListAgent(data);
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
      email,
      customerName,
      picName,
      picPhone,
      alamatToko,
      noNpwp,
    }: AgentInput) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.addAgent({
          email,
          customerName,
          picName,
          picPhone,
          alamatToko,
          noNpwp,
          createdBy: detailUsers.fullname,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          getAllAgent({ skip: 0, take: 100 });
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
    [detailUsers?.fullname, getAllAgent, logoutUser]
  );

  const editAgent = React.useCallback(
    async ({
      agentId,
      email,
      customerName,
      picName,
      picPhone,
      alamatToko,
      noNpwp,
    }: AgentInput) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.editAgent({
          agentId,
          email,
          customerName,
          picName,
          picPhone,
          alamatToko,
          noNpwp,
          modifiedBy: detailUsers.fullname,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          getAllAgent({ skip: 0, take: 100 });
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
    [detailUsers?.fullname, getAllAgent, logoutUser]
  );

  React.useEffect(() => {
    getPageData({ skip: 0, take: 100 });
  }, [getPageData]);

  const handleInputChangeAddAgent = (e: any) => {
    const { name, value } = e.target;

    setAgentInput((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInputChangeEditAgent = (e: any) => {
    const { name, value } = e.target;

    setAgentEditInput((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
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
              onSubmit={(e: any) => {
                e.preventDefault();

                addAgent(agentInput);
              }}
            >
              <h6 className="text-black font-bold">Create Agent</h6>

              <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
                <TextField
                  name="customerName"
                  id="customerName"
                  label="Nama Customer"
                  type={"text"}
                  size="small"
                  placeholder="Nama Lengkap"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeAddAgent}
                />

                <TextField
                  name="alamatToko"
                  id="alamatToko"
                  label="Alamat Toko"
                  type={"text"}
                  size="small"
                  placeholder="Alamat"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeAddAgent}
                />

                <TextField
                  name="noNpwp"
                  id="noNpwp"
                  label="NPWP"
                  type={"text"}
                  size="small"
                  placeholder="hanya angka (15 digit)"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  inputProps={{ maxLength: 15 }}
                  onChange={handleInputChangeAddAgent}
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
                  onChange={handleInputChangeAddAgent}
                />

                <TextField
                  name="picName"
                  id="picName"
                  label="PIC Name"
                  type={"text"}
                  size="small"
                  required
                  placeholder="Nama Lengkap"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeAddAgent}
                />

                <TextField
                  name="picPhone"
                  id="picPhone"
                  label="PIC No. HP"
                  type={"text"}
                  size="small"
                  placeholder="+62xx"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  onChange={handleInputChangeAddAgent}
                />
              </div>

              <button
                type="submit"
                className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Add Agent
              </button>
            </form>

            <div className="m-10 flex flex-col">
              <Search
                onSearch={({ value }) => {
                  searchAgent({ value });
                }}
              />

              <DataGrid
                pagination={true}
                autoHeight
                getRowHeight={() => "auto"}
                rowSelection={false}
                rows={listAgent}
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
                    renderCell: (params: any) => {
                      return (
                        <div className="grid grid-cols-1 gap-2 my-2 place-content-center place-items-center">
                          <Button
                            className="bg-red-700 text-sm hover:bg-red-300"
                            variant="contained"
                            size="small"
                            onClick={(e: any) => {
                              e.preventDefault();

                              const findAgent = _.find(listAgent, {
                                id: params.id,
                              });

                              const updatedAgent = _.mapKeys(
                                findAgent,
                                (value, key) => {
                                  if (key === "id") {
                                    return "agentId";
                                  }
                                  return key;
                                }
                              ) as any;

                              setEditOpen(true);
                              setAgentEditInput(updatedAgent);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      );
                    },
                  },
                  {
                    field: "customerName",
                    headerName: "Customer Name",
                    minWidth: 150,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "alamatToko",
                    headerName: "Alamat",
                    hideSortIcons: true,
                    disableColumnMenu: true,
                    minWidth: 325,
                    align: "center",
                    headerAlign: "center",
                    editable: false,
                    renderCell: (params) => {
                      return (
                        <div className="grid grid-rows-1 gap-2 my-2 place-content-center place-items-center">
                          <a
                            href={`https://maps.google.com?q=${params.value}`}
                            target="_blank"
                          >
                            <span>{params.value}</span>
                          </a>
                        </div>
                      );
                    },
                  },
                  {
                    field: "noNpwp",
                    headerName: "NPWP",
                    minWidth: 150,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "picName",
                    headerName: "PIC Name",
                    minWidth: 150,
                    align: "left",
                    headerAlign: "center",
                    editable: false,
                  },
                  {
                    field: "picPhone",
                    headerName: "PIC Phone",
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
                    field: "createdBy",
                    headerName: "Created By",
                    headerAlign: "center",
                    minWidth: 150,
                    editable: false,
                  },
                  {
                    field: "createdAt",
                    headerName: "Created At",
                    headerAlign: "center",
                    minWidth: 150,
                    editable: false,
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY hh:mm"),
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
                    valueFormatter: (params: any) =>
                      moment(params?.value).format("DD/MM/YYYY hh:mm"),
                  },
                ]}
              />

              <div className="flex justify-center py-4">
                <Pagination
                  count={totalPage}
                  page={currentPage}
                  onChange={async (
                    event: React.ChangeEvent<unknown>,
                    value: number
                  ) => {
                    setCurrentPage(value);
                    getAllAgent({
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
                editAgent(agentEditInput);
                setEditOpen(false);
              },
            }}
          >
            <DialogContent className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
              <h6 className="text-black text-bold text-lg text-center">
                <strong>Edit Agent</strong>
              </h6>

              <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
                <TextField
                  name="customerName"
                  id="customerName"
                  label="Nama Customer"
                  type={"text"}
                  size="small"
                  placeholder="Nama Lengkap"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  value={agentEditInput.customerName}
                  onChange={handleInputChangeEditAgent}
                />

                <TextField
                  name="alamatToko"
                  id="alamatToko"
                  label="Alamat Toko"
                  type={"text"}
                  size="small"
                  placeholder="Alamat"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  value={agentEditInput.alamatToko}
                  onChange={handleInputChangeEditAgent}
                />

                <TextField
                  name="noNpwp"
                  id="noNpwp"
                  label="NPWP"
                  type={"text"}
                  size="small"
                  placeholder="hanya angka (15 digit)"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  inputProps={{ maxLength: 15 }}
                  value={(agentEditInput?.noNpwp || "")
                    .toString()
                    .replace(/[^0-9]/g, "")}
                  onChange={handleInputChangeEditAgent}
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
                  value={agentEditInput.email}
                  onChange={handleInputChangeEditAgent}
                />

                <TextField
                  name="picName"
                  id="picName"
                  label="PIC Name"
                  type={"text"}
                  size="small"
                  required
                  placeholder="Nama Lengkap"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  value={agentEditInput.picName}
                  onChange={handleInputChangeEditAgent}
                />

                <TextField
                  name="picPhone"
                  id="picPhone"
                  label="PIC No. HP"
                  type={"text"}
                  size="small"
                  placeholder="+62xx"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  value={agentEditInput.picPhone}
                  onChange={handleInputChangeEditAgent}
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
        </Suspense>

        <Loader active={loading} />
      </main>
    </ThemeProvider>
  );
}
