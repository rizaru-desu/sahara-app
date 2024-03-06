/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import { Carousel } from "react-responsive-carousel";
import { DataGrid } from "@mui/x-data-grid";
import _ from "lodash";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import Loader from "@/app/component/loader";
import Loading from "@/app/loading";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

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
        console.log(topTenPoint);
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
          <div className="grid lg:grid-cols-2 grid-cols-1 place-content-center place-items-center gap-5">
            <div className="bg-white gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex ">
              <div className="w-auto h-[300px]">
                <DataGrid
                  getRowHeight={() => "auto"}
                  rows={listPoint}
                  disableRowSelectionOnClick
                  columns={[
                    {
                      field: "fullName",
                      headerName: "Fullname",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                    },
                    {
                      field: "loyaltyPoint",
                      headerName: "Loyalty Point",
                      minWidth: 250,
                      align: "center",
                      headerAlign: "center",
                      editable: false,
                    },
                  ]}
                />
              </div>
            </div>

            <div className="bg-white gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex ">
              <Carousel autoPlay interval={5000} showThumbs={false}>
                {_.map(
                  _.isEmpty(listCampaign)
                    ? [
                        {
                          campaignName: "Campaign is Empty",
                          description: "Please set Cammpaign",
                          photo:
                            "https://placehold.co/1080x1350/jpg?text=Empty\nCampaign",
                        },
                      ]
                    : listCampaign,
                  (item: any) => {
                    return (
                      <div>
                        <img
                          className="h-[675px] w-auto bg-cover"
                          src={item.photo}
                        />
                        <p className="legend">
                          {item.campaignName}
                          <br />
                          {item.description}
                        </p>
                      </div>
                    );
                  }
                )}
              </Carousel>
            </div>
          </div>
        </div>
      </Suspense>

      <Loader active={loading} />
    </main>
  );
}
