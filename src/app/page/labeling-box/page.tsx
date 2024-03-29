"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  Pagination,
  Switch,
  TextField,
} from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { customTheme } from "@/app/component/theme";
import { DataGrid } from "@mui/x-data-grid";
import { MdPrint, MdPrintDisabled } from "react-icons/md";
import _ from "lodash";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import Loader from "@/app/component/loader";
import Loading from "@/app/loading";
import Search from "@/app/component/search";
import moment from "moment";
import * as XLSX from "xlsx";
import ScanLabel from "@/app/component/scanLabel";
import { FaSearch } from "react-icons/fa";

export default function Home() {
  const router = useRouter();
  const outerTheme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);
  //** Label Product */
  const [listLabel, setListLabel] = React.useState<any[]>([]);
  const [selectLabel, setSelectLabel] = React.useState<any[]>([]);
  const [labelId, setLabelId] = React.useState<string[]>([]);
  const [leader, setLeader] = React.useState<string>("");
  const [location, setLocation] = React.useState<string>("");
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  //** Label Box */
  const [listLabelBox, setListLabelBox] = React.useState<any[]>([]);
  const [selectLabelBox, setSelectLabelBox] = React.useState<any[]>([]);
  const [labelIdBox, setLabelIdBox] = React.useState<string[]>([]);
  const [totalBoxPage, setTotalBoxPage] = React.useState<number>(0);
  const [currentBoxPage, setCurrentBoxPage] = React.useState<number>(1);
  const [totalBoxData, setTotalBoxData] = React.useState<number>(0);

  const [scanOpen, setScanOpen] = React.useState<boolean>(false);
  const [scanData, setScanData] = React.useState<any[]>([]);
  const [scanValue, setScanValue] = React.useState<string>("");

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
        const responseApi = await authService.getPageLabelBoxData({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const {
            userDetail,
            allLabelBox,
            allLabel,
            countLabel,
            countLabelBox,
          } = responseApi.data;
          setLoading(false);
          setTotalPage(Math.ceil(countLabel / 100));
          setTotalBoxPage(Math.ceil(countLabelBox / 100));
          setDetailUsers(userDetail);
          setListLabel(allLabel);
          setListLabelBox(allLabelBox);
          setTotalBoxData(countLabelBox);
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

  const getAllLabelBox = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getLabelingBox({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allLabelBox, countLabelBox } = responseApi.data;
          setLoading(false);
          setListLabelBox(allLabelBox);
          setTotalBoxPage(Math.ceil(countLabelBox / 500));
          setTotalBoxData(countLabelBox);
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

  const getAllLabelBoxProducts = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getLabelingBoxProducts({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allLabelProduct, countLabelProduct } = responseApi.data;
          setLoading(false);
          setListLabel(allLabelProduct);
          setTotalPage(Math.ceil(countLabelProduct / 100));
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

  const addLabel = React.useCallback(async () => {
    try {
      setLoading(true);

      const dateString = moment(new Date(), "YYYY-MM-DD HH:mm:ss").diff(
        moment("1899-12-30", "YYYY-MM-DD"),
        "days"
      );

      let totalDatas = totalBoxData;

      const authService = new Services();
      const responseApi = await authService.addLabelBox({
        leader: leader,
        labelIds: labelId,
        labelCodeBox: `PSBI${dateString}${_.toUpper(
          _.map(leader.split(" "), (word) => word[0]).join("")
        )}${moment().format("MM")}${(totalDatas += 1)}`,
        createdBy: detailUsers.fullname,
      });

      if (responseApi.status === 200) {
        const { message } = responseApi.data;
        setLoading(false);
        toastMessage({
          message: message,
          type: "success",
        });
        getAllLabelBox({
          skip: 0,
          take: 500,
        });
        getAllLabelBoxProducts({
          skip: 0,
          take: 100,
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
  }, [
    detailUsers?.fullname,
    getAllLabelBox,
    getAllLabelBoxProducts,
    labelId,
    leader,
    logoutUser,
    totalBoxData,
  ]);

  const searchLabelBox = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.searchLabelBox({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setListLabelBox(data);
          setTotalBoxPage(1);
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

  const searchLabelBoxProducts = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.searchLabelBoxProducts({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setListLabel(data);
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

  const scanProducts = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.searchLabelBoxProducts({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setScanValue("");
          let valuesToAdd = _.differenceBy(data, scanData, "labelCode");

          const cloneData = _.clone(scanData);
          cloneData.push(...valuesToAdd);
          setScanData(cloneData);
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
    [logoutUser, scanData]
  );

  const exportLabel = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new Services();
      const responseApi = await authService.printerLabelBox({
        labelIds: labelIdBox,
      });

      if (responseApi.status === 200) {
        const { message, data } = responseApi.data;
        setLoading(false);
        toastMessage({
          message: message,
          type: "success",
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "LabelBox");
        XLSX.writeFile(
          wb,
          `Printer Box ${moment().format("DD-MM-YYYY")}-${
            Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
          }.xlsx`
        );
        getAllLabelBox({ skip: 0, take: 100 });
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
  }, [getAllLabelBox, labelIdBox, logoutUser]);

  React.useEffect(() => {
    getPageData({ skip: 0, take: 100 });
  }, [getPageData]);

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
            <div className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
              <h6 className="text-black text-bold">
                <strong>Create label box</strong>
              </h6>

              <div className="gap-5 flex flex-row justify-between">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-row gap-1 items-center">
                    <Checkbox
                      value={scanOpen}
                      color="default"
                      onChange={(event) => {
                        const isChecked = event.target.checked;
                        setScanOpen(isChecked);
                        if (!isChecked) {
                          setLabelId([]);
                          setSelectLabel([]);
                          setScanData([]);
                        }
                      }}
                    />
                    <label className="text-black">Mode Scan</label>
                  </div>

                  {scanOpen ? (
                    <div className="flex items-center m-[2px] mb-3">
                      <TextField
                        name="value"
                        id="value"
                        label="Scan"
                        type={"text"}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        value={scanValue}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <button className="text-black" type="submit">
                                <FaSearch size={20} />
                              </button>
                            </InputAdornment>
                          ),
                        }}
                        onKeyDown={(e) => {
                          if (e.keyCode === 13 || e.key === "Enter") {
                            if (_.size(scanValue) >= 3) {
                              scanProducts({ value: scanValue });
                            } else {
                              toastMessage({
                                message: "Minimum of 3 letters",
                                type: "error",
                              });
                            }
                          }
                        }}
                        onChange={(e) => {
                          const { value } = e.target;
                          setScanValue(e.target.value);
                        }}
                      />
                    </div>
                  ) : (
                    <Search
                      onSearch={({ value }) => {
                        searchLabelBoxProducts({ value });
                      }}
                    />
                  )}
                </div>

                <form
                  className="gap-3 flex-col flex"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addLabel();
                  }}
                >
                  <TextField
                    name="leader"
                    id="leader"
                    label="Leader"
                    type={"text"}
                    size="small"
                    required
                    value={leader}
                    placeholder="Input Atasan/Leader"
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    onChange={(e) => {
                      const { value } = e.target;
                      setLeader(value);
                    }}
                  />

                  <button
                    type="submit"
                    disabled={!_.isEmpty(selectLabel) ? false : true}
                    className="
                 flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:bg-red-400"
                  >
                    Generate
                  </button>
                </form>
              </div>

              <div className="w-auto h-[300px]">
                <DataGrid
                  pagination={true}
                  getRowHeight={() => "auto"}
                  rows={scanOpen ? scanData : listLabel}
                  checkboxSelection
                  disableRowSelectionOnClick
                  /* sx={{
                  "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
                    {
                      display: "none",
                    },
                }} */
                  onRowSelectionModelChange={(ids: any) => {
                    const arrayId = _.split(ids, ",");
                    const filteredData = _.filter(listLabel, (item: any) =>
                      arrayId.includes(item.id)
                    );

                    setLabelId(arrayId);
                    setSelectLabel(filteredData);
                  }}
                  columns={[
                    {
                      field: "productCode",
                      headerName: "Product Code",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "labelCode",
                      headerName: "Label Product Code",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "bestBefore",
                      headerName: "Best Before",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                      valueFormatter: (params: any) =>
                        moment(params?.value).format("DD/MM/YYYY"),
                    },
                    {
                      field: "printed",
                      headerName: "Printed",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                      renderCell: (params) => {
                        return params.value === 0 ? (
                          <MdPrintDisabled />
                        ) : (
                          <MdPrint />
                        );
                      },
                    },
                    {
                      field: "createdBy",
                      headerName: "Created By",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 250,
                      editable: false,
                    },
                    {
                      field: "createdAt",
                      headerName: "Created At",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 250,
                      editable: false,
                      valueFormatter: (params: any) =>
                        moment(params?.value).format("DD/MM/YYYY hh:mm"),
                    },
                    {
                      field: "modifiedBy",
                      headerName: "Modified By",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 250,
                      editable: false,
                    },
                    {
                      field: "modifedAt",
                      headerName: "Modifed At",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 250,
                      editable: false,
                      valueFormatter: (params: any) =>
                        moment(params?.value).format("DD/MM/YYYY hh:mm"),
                    },
                  ]}
                />
              </div>

              {scanOpen ? null : (
                <div className="flex justify-center py-4">
                  <Pagination
                    count={totalPage}
                    page={currentPage}
                    onChange={async (
                      event: React.ChangeEvent<unknown>,
                      value: number
                    ) => {
                      setCurrentPage(value);
                      getAllLabelBoxProducts({
                        skip: Math.max(0, (value - 1) * 100),
                        take: 100,
                      });
                    }}
                    shape="rounded"
                  />
                </div>
              )}
            </div>

            <div className="m-10 flex flex-col">
              <Search
                onSearch={({ value }) => {
                  searchLabelBox({ value });
                }}
              />

              <div className="w-auto h-[700px]">
                <DataGrid
                  pagination={true}
                  getRowHeight={() => "auto"}
                  rows={listLabelBox}
                  checkboxSelection
                  disableRowSelectionOnClick
                  onRowSelectionModelChange={(ids: any) => {
                    const arrayId = _.split(ids, ",");
                    const filteredData = _.filter(listLabelBox, (item: any) =>
                      arrayId.includes(item.id)
                    );
                    setLabelIdBox(arrayId);
                    setSelectLabelBox(filteredData);
                  }}
                  slots={{
                    toolbar: () => (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          exportLabel();
                        }}
                        className={`${
                          !_.isEmpty(selectLabelBox) ? "block" : "hidden"
                        } self-start m-2 justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700`}
                      >
                        Export to printing
                      </button>
                    ),
                  }}
                  columns={[
                    {
                      field: "PackageDate",
                      headerName: "Package Date",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                      valueFormatter: (params: any) =>
                        moment(params?.value).format("DD/MM/YYYY"),
                    },
                    {
                      field: "labelCodeBox",
                      headerName: "Label Box Code",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "totalProduct",
                      headerName: "Total Product",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "leader",
                      headerName: "Leader / Atasan",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "statusBox",
                      headerName: "Status",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                      renderCell: (params) => {
                        const status = [
                          { text: "On Created", color: "bg-blue-500" },
                          { text: "Printed", color: "bg-green-500" },
                          { text: "Canceled", color: "bg-red-500" },
                        ] as any;

                        const getStatusInfo = _.find(status, {
                          text: params.value,
                        });

                        return (
                          <span
                            className={`justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm ${getStatusInfo.color}`}
                          >
                            {params.value}
                          </span>
                        );
                      },
                    },
                    {
                      field: "createdBy",
                      headerName: "Created By",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 250,
                      editable: false,
                    },
                    {
                      field: "createdAt",
                      headerName: "Created At",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 250,
                      editable: false,
                      valueFormatter: (params: any) =>
                        moment(params?.value).format("DD/MM/YYYY hh:mm"),
                    },
                    {
                      field: "modifiedBy",
                      headerName: "Modified By",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 250,
                      editable: false,
                    },
                    {
                      field: "modifedAt",
                      headerName: "Modifed At",
                      align: "center",
                      headerAlign: "center",
                      minWidth: 250,
                      editable: false,
                      valueFormatter: (params: any) =>
                        moment(params?.value).format("DD/MM/YYYY hh:mm"),
                    },
                  ]}
                />
              </div>

              <div className="flex justify-center py-4">
                <Pagination
                  count={totalBoxPage}
                  page={currentBoxPage}
                  onChange={async (
                    event: React.ChangeEvent<unknown>,
                    value: number
                  ) => {
                    setCurrentBoxPage(value);
                    getAllLabelBox({
                      skip: Math.max(0, (value - 1) * 100),
                      take: 100,
                    });
                  }}
                  shape="rounded"
                />
              </div>
            </div>
          </div>
        </Suspense>

        <Loader active={loading} />
      </main>
    </ThemeProvider>
  );
}
