/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import _ from "lodash";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import Loader from "@/app/component/loader";
import Loading from "@/app/loading";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [menuOpen, isMenuOpen] = React.useState(false);
  const [detailUsers, setDetailUsers] = React.useState<any>(undefined);

  const [listCampaign, setListCampaign] = React.useState<any[]>([]);
  const [listPoint, setListPoint] = React.useState<any[]>([]);

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

  const getPageData = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new Services();
      const responseApi = await authService.getPageDashboardData();

      if (responseApi.status === 200) {
        const { topTenPoint, activeCampaign, userDetail } = responseApi.data;
        setLoading(false);
        setListPoint(topTenPoint);
        setListCampaign(activeCampaign);

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
  }, [logoutUser]);

  React.useEffect(() => {
    getPageData();
  }, [getPageData]);

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
          <div className="grid grid-cols-2 place-content-center place-items-center">
            <div className="bg-white gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex ">
              <Bar
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                    title: {
                      display: true,
                      text: "Top 10 Loyalty",
                    },
                  },
                }}
                data={{
                  labels: ["TOP 10"],
                  datasets: listPoint,
                }}
              />
            </div>

            <div className="bg-white gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex ">
              <Carousel autoPlay interval={5000} showThumbs={false}>
                {_.map(listCampaign, (item: any) => {
                  return (
                    <div>
                      <img
                        className="h-[420px] w-auto bg-cover"
                        src={item.photo}
                      />
                      <p className="legend">
                        {item.campaignName}
                        <br />
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </Carousel>
            </div>
          </div>
        </div>
      </Suspense>

      <Loader active={loading} />
    </main>
  );
}
