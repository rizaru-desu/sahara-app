"use client";

import React, { Suspense } from "react";
import _ from "lodash";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { useRouter } from "next/navigation";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import { Bar } from "react-chartjs-2";
import { DataGrid } from "@mui/x-data-grid";
import { Pagination } from "@mui/material";

import Loader from "../component/loader";
import Loading from "../loading";
import { AuthService } from "../utils/services/auth.service";
import { toastMessage } from "../component/toasttify";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend
);

const data = {
  labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "# of Votes",
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

const labels = ["January", "February", "March", "April", "May", "June", "July"];
const generateRandomNumber = (min: any, max: any) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const dataBar = {
  labels,
  datasets: [
    {
      label: "Dataset 1",
      data: labels.map(() => generateRandomNumber(0, 1000)),
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "Dataset 2",
      data: labels.map(() => generateRandomNumber(0, 1000)),
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

interface UserData {
  roleId?: {
    key: number;
  };
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [dataUser, setDataUser] = React.useState<UserData | undefined>(
    undefined
  );

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

  React.useEffect(() => {
    detailUser();
  }, [detailUser]);

  return (
    <main className="dark:bg-white bg-white min-h-screen">
      <SideBar opens={menuOpen} closeds={open} roles={dataUser?.roleId?.key} />
      <NavBar
        items={{ label: "Dashboard", link: "#" }}
        opens={open}
        data={dataUser}
      />

      <Suspense fallback={<Loading />}>
        <div className="p-4 xl:ml-80 gap-12">
          <div className="gap-2 grid grid-flow-row grid-cols-1 md:grid-cols-2 place-content-center place-items-center">
            <div className="h-80">
              <Pie data={data} updateMode="resize" />
            </div>

            <div className="h-80 w-full">
              <Bar
                options={{
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                    title: {
                      display: true,
                      text: "Chart.js Bar Chart",
                    },
                  },
                }}
                data={dataBar}
              />
            </div>
          </div>

          <div className="h-[450px] m-10">
            <DataGrid
              pagination={true}
              autoHeight
              rows={[]}
              columns={[]}
              rowSelection={false}
            />

            <div className="flex justify-center py-4">
              <Pagination count={1} page={1} shape="rounded" />
            </div>

            <div className="flex justify-end mt-3">
              <div className="relative m-[2px] mb-3 float-right block">
                <label htmlFor="inputFilter" className="sr-only">
                  Filter
                </label>
                <select
                  id="inputFilter"
                  className="block w-40 text-white rounded-lg border dark:border-none dark:bg-red-700 bg-red-700 p-2 text-sm focus:border-white-400 focus:outline-none focus:ring-1 focus:ring-white-400"
                  defaultValue={1} // Set the defaultValue here
                >
                  <option value={1}>Last week</option>
                  <option value={2}>Last month</option>
                  <option value={3}>Yesterday</option>
                  <option value={4}>Last 7 days</option>
                  <option value={5}>Last 30 days</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Suspense>

      <Loader active={loading} />
    </main>
  );
}
