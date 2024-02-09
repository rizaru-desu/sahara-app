"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import { Pagination, TextField } from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { customTheme } from "@/app/component/theme";
import { DataGrid } from "@mui/x-data-grid";
import { MdPrint, MdPrintDisabled } from "react-icons/md";
import Select from "react-dropdown-select";
import _ from "lodash";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import Loader from "@/app/component/loader";
import Loading from "@/app/loading";
import Search from "@/app/component/search";
import moment from "moment";
import * as XLSX from "xlsx";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);

  const [totalPage, setTotalPage] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

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

  const detailUser = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new Services();
      const responseApi = await authService.detailUser();

      if (responseApi.status === 200) {
        const { data } = responseApi.data;
        setLoading(false);
        setDetailUsers(data);
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

  return (
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
            className="flex flex-col gap-5 "
            onSubmit={(e: any) => {
              e.preventDefault();
            }}
          >
            <h6 className="text-black font-bold">Default Point</h6>

            <div className="flex flex-row item-center gap-5">
              <TextField
                name="customerName"
                id="customerName"
                label="Point"
                type={"number"}
                size="small"
                inputProps={{ min: 0 }}
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />

              <button
                type="submit"
                className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Simpan
              </button>
            </div>
          </form>

          <div className="m-10 flex flex-col">
            <form
              className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col"
              onSubmit={(e: any) => {
                e.preventDefault();
              }}
            >
              <h6 className="text-black font-bold">Add Campaign</h6>

              <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
                <TextField
                  name="customerName"
                  id="customerName"
                  label="Campaign Name"
                  type={"text"}
                  size="small"
                  placeholder="Nama Lengkap"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                />

                <TextField
                  name="customerName"
                  id="customerName"
                  label="Start Date"
                  type={"date"}
                  inputProps={{ min: moment().format("YYYY-MM-DD") }}
                  size="small"
                  placeholder="Nama Lengkap"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                />

                <TextField
                  name="customerName"
                  id="customerName"
                  label="End Date"
                  inputProps={{ min: moment().format("YYYY-MM-DD") }}
                  type={"date"}
                  size="small"
                  placeholder="Nama Lengkap"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                />

                <Select
                  options={[]}
                  valueField="productId"
                  labelField="productName"
                  color="#b91c1c"
                  searchBy="productName"
                  searchable
                  required
                  clearable
                  placeholder="Select Product"
                  className="text-black"
                />

                <TextField
                  name="customerName"
                  id="customerName"
                  label="Point"
                  type={"number"}
                  size="small"
                  inputProps={{ min: 0 }}
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />

                <TextField
                  name="customerName"
                  id="customerName"
                  label="add Image"
                  type={"file"}
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                />
              </div>

              <button
                type="submit"
                className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Simpan
              </button>
            </form>
          </div>

          <div className="m-10 flex flex-col">
            <Search onSearch={({ value }) => {}} />

            <DataGrid
              pagination={true}
              autoHeight
              getRowHeight={() => "auto"}
              rows={[]}
              disableRowSelectionOnClick
              columns={[
                {
                  field: "productCode",
                  headerName: "Product Code",
                  minWidth: 250,
                  align: "left",
                  headerAlign: "center",
                  editable: false,
                },
                {
                  field: "labelCode",
                  headerName: "Label Product Code",
                  minWidth: 250,
                  align: "left",
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
                  /* getAllLabelProduct({
                      skip: Math.max(0, (value - 1) * 100),
                      take: 100,
                    }); */
                }}
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
