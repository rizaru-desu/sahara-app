"use client";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import { Pagination, Dialog, DialogContent, TextField } from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { customTheme } from "@/app/component/theme";
import { DataGrid } from "@mui/x-data-grid";
import { DateRange } from "react-date-range";
import _ from "lodash";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import Loader from "@/app/component/loader";
import Loading from "@/app/loading";
import Search from "@/app/component/search";
import moment from "moment";
import * as XLSX from "xlsx";

interface PenaltyInput {
  pointId: string;
  userId: string;
  point: number;
  loyaltyPoint: string;
  remark: string;
}

export default function Home() {
  const router = useRouter();
  const outerTheme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);
  const [listLoyalty, setLoyalty] = React.useState<any[]>([]);
  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const [penaltyOpen, setPenaltyOpen] = React.useState<boolean>(false);
  const [penaltyInput, setPenaltyInput] = React.useState<PenaltyInput>({
    point: 0,
    userId: "",
    pointId: "",
    loyaltyPoint: "",
    remark: "",
  });
  const [userCurrentPoint, setUserCurrentPoint] =
    React.useState<any>(undefined);

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

  const getPageData = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getPageLoyaltyPointData({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allLoyalty, countLoyalty, userDetail } = responseApi.data;
          setLoading(false);
          setLoyalty(allLoyalty);
          setTotalPage(Math.ceil(countLoyalty / 100));
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

  const getAllLoyalty = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const authService = new Services();
        const responseApi = await authService.getLoyaltyPoint({
          skip,
          take,
        });

        if (responseApi.status === 200) {
          const { allLoyalty, countLoyalty } = responseApi.data;
          setLoading(false);
          setLoyalty(allLoyalty);
          setTotalPage(Math.ceil(countLoyalty / 100));
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

  const searchLoyalty = React.useCallback(
    async ({ value }: { value: string }) => {
      try {
        setLoading(true);

        const authService = new Services();
        const responseApi = await authService.searchLoyalty({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setLoyalty(data);
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

  const addPenalty = React.useCallback(async () => {
    try {
      setLoading(true);

      const authService = new Services();
      const responseApi = await authService.addPenaltyLoyalty({
        pointId: userCurrentPoint.pointId,
        userId: userCurrentPoint.userId,
        point: _.subtract(userCurrentPoint.loyaltyPoint, penaltyInput.point),
        loyaltyPoint: `-${penaltyInput.point}`,
        remarks: penaltyInput.remark,
        createdBy: detailUsers.fullname,
      });

      if (responseApi.status === 200) {
        const { message } = responseApi.data;
        setLoading(false);
        toastMessage({
          message: message,
          type: "success",
        });
        getAllLoyalty({ skip: 0, take: 500 });
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
    logoutUser,
    penaltyInput.point,
    penaltyInput.remark,
    userCurrentPoint,
    getAllLoyalty,
  ]);

  React.useEffect(() => {
    getPageData({ skip: 0, take: 500 });
  }, [getPageData]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    setPenaltyInput((prevData: any) => ({
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
          <div className="p-4 xl:ml-80 gap-12 min-h-screen">
            <Search
              onSearch={({ value }) => {
                searchLoyalty({ value });
              }}
            />

            <DataGrid
              pagination={true}
              autoHeight
              getRowHeight={() => "auto"}
              rows={listLoyalty}
              getRowId={(rows) => rows.pointId}
              disableRowSelectionOnClick
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
                      <div className="grid grid-cols-2 my-2 place-content-center place-items-center">
                        <button
                          type="button"
                          className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                          onClick={(e: any) => {
                            e.preventDefault();

                            router.push(`/page/point-loyalty/${params.id}`);
                          }}
                        >
                          Log
                        </button>

                        <button
                          type="button"
                          className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                          onClick={(e: any) => {
                            e.preventDefault();

                            const findPoint = _.find(listLoyalty, {
                              pointId: params.id,
                            });
                            setUserCurrentPoint(findPoint);
                            setPenaltyOpen(true);
                          }}
                        >
                          Penalty
                        </button>
                      </div>
                    );
                  },
                },
                {
                  field: "fullname",
                  headerName: "Fullname",
                  minWidth: 250,
                  align: "left",
                  headerAlign: "center",
                  editable: false,
                },
                {
                  field: "email",
                  headerName: "Email",
                  minWidth: 250,
                  align: "center",
                  headerAlign: "center",
                  editable: false,
                },
                {
                  field: "phone",
                  headerName: "Phone",
                  minWidth: 250,
                  align: "left",
                  headerAlign: "center",
                  editable: false,
                },

                {
                  field: "loyaltyPoint",
                  headerName: "Loyalty Point",
                  minWidth: 250,
                  align: "right",
                  headerAlign: "center",
                  editable: false,
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
                  valueFormatter: (params: any) =>
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
                  getAllLoyalty({
                    skip: Math.max(0, (value - 1) * 100),
                    take: 100,
                  });
                }}
                shape="rounded"
              />
            </div>
          </div>

          <Dialog
            open={penaltyOpen}
            onClose={() => {
              setPenaltyOpen(false);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
              component: "form",
              onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                addPenalty();
                setPenaltyOpen(false);
              },
            }}
          >
            <DialogContent className="bg-white w-full justify-center items-center gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
              <div className="flex flex-col gap-5">
                <h6 className="text-black text-bold text-lg text-center">
                  <strong>Add Penalty</strong>
                </h6>

                <div className="grid  grid-cols-2 gap-5">
                  <TextField
                    name="point"
                    id="point"
                    label="Point (-)"
                    type={"number"}
                    size="small"
                    required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: 0 }}
                    variant="outlined"
                    fullWidth
                    onChange={handleInputChange}
                  />

                  <TextField
                    name="remark"
                    id="remark"
                    label="Remarks"
                    type={"text"}
                    size="small"
                    placeholder="Remarks"
                    multiline
                    required
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth
                    maxRows={4}
                    onChange={handleInputChange}
                  />
                </div>

                <button
                  type="submit"
                  className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:bg-red-300"
                >
                  Submit Penalty
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </Suspense>

        <Loader active={loading} />
      </main>
    </ThemeProvider>
  );
}
