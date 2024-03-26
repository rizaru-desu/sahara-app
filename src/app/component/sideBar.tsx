import _ from "lodash";
import React from "react";
import { MdSpaceDashboard } from "react-icons/md";
import { FaShop } from "react-icons/fa6";
import {
  FaUserFriends,
  FaUserCog,
  FaBox,
  FaCog,
  FaQrcode,
  FaWarehouse,
  FaBoxOpen,
} from "react-icons/fa";
import { GiWantedReward } from "react-icons/gi";
import { FaBoxesPacking } from "react-icons/fa6";
import { RiMoneyEuroCircleFill } from "react-icons/ri";
import { useRouter } from "next/navigation";

function SideBar({
  roles,
  opens,
  closeds,
}: {
  roles?: string[];
  opens: boolean;
  closeds: () => void;
}) {
  const router = useRouter();

  const SideMenu = React.useMemo(
    () => [
      {
        title: "Master Data",
        href: "#",
        header: true,
        icon: undefined,
      },
      {
        title: "Product",
        href: "/page/product",
        header: false,
        icon: <FaBox size={25} color={"#fff"} />,
        roles: [
          "d4ead12a-564e-4f32-b5bb-84ccd253f904",
          "024e2013-6bda-44bb-9557-c6838996d24a", //Admin PPIC
          "548c0702-cc0e-11ee-8e87-38f9d362e2c9", //Admin Marketing
        ],
      },
      {
        title: "Agent",
        href: "/page/agent",
        header: false,
        icon: <FaUserFriends size={25} color={"#fff"} />,
        roles: ["d4ead12a-564e-4f32-b5bb-84ccd253f904"],
      },
      {
        title: "Owner Booth",
        href: "/page/owner-booth",
        header: false,
        icon: <FaShop size={25} color={"#fff"} />,
        roles: ["d4ead12a-564e-4f32-b5bb-84ccd253f904"],
      },
      {
        title: "All Users",
        href: "/page/all-users",
        header: false,
        icon: <FaUserCog size={25} color={"#fff"} />,
        roles: ["d4ead12a-564e-4f32-b5bb-84ccd253f904"],
      },
      {
        title: "Campaign",
        href: "/page/point-campaign",
        header: false,
        icon: <FaCog size={25} color={"#fff"} />,
        roles: [
          "d4ead12a-564e-4f32-b5bb-84ccd253f904",
          "548c0702-cc0e-11ee-8e87-38f9d362e2c9", //Admin Marketing
        ],
      },
      {
        title: "Package Redeem",
        href: "/page/package-redeem",
        header: false,
        icon: <GiWantedReward size={25} color={"#fff"} />,
        roles: [
          "d4ead12a-564e-4f32-b5bb-84ccd253f904",
          "548c0702-cc0e-11ee-8e87-38f9d362e2c9", //Admin Marketing
        ],
      },
      { title: "Inventory", href: "#", header: true, roles: [0] },
      {
        title: "Labeling",
        href: "/page/labeling-product",
        header: false,
        icon: <FaQrcode size={25} color={"#fff"} />,
        roles: [
          "d4ead12a-564e-4f32-b5bb-84ccd253f904",
          "024e2013-6bda-44bb-9557-c6838996d24a", //Admin PPIC
          "81c44b38-0fc4-446f-a68b-a66a26035a3a", //Admin Product
        ],
      },
      {
        title: "Labeling Box",
        href: "/page/labeling-box",
        header: false,
        icon: <FaBoxOpen size={25} color={"#fff"} />,
        roles: [
          "d4ead12a-564e-4f32-b5bb-84ccd253f904",
          "024e2013-6bda-44bb-9557-c6838996d24a", //Admin PPIC
          "c03a5d0b-f3de-4ab1-8501-165ce79b0e74", //Admin Gudang
        ],
      },
      {
        title: "Stock",
        href: "/page/stock-product",
        header: false,
        icon: <FaWarehouse size={25} color={"#fff"} />,
        roles: [
          "d4ead12a-564e-4f32-b5bb-84ccd253f904",
          "aaf7daac-cb1f-11ee-b237-38f9d362e2c9",
          "024e2013-6bda-44bb-9557-c6838996d24a", //Admin PPIC
        ],
      },

      {
        title: "Distribution",
        href: "#",
        header: true,
        icon: undefined,
        roles: ["d4ead12a-564e-4f32-b5bb-84ccd253f904"],
      },
      {
        title: "Delivery Order",
        href: "/page/delivery-order",
        header: false,
        icon: <FaBoxesPacking size={25} color={"#fff"} />,
        roles: [
          "d4ead12a-564e-4f32-b5bb-84ccd253f904",
          "024e2013-6bda-44bb-9557-c6838996d24a", //Admin PPIC
          "8f595a1e-cb1f-11ee-b237-38f9d362e2c9", //Admin Delivery
        ],
      },
      {
        title: "Loyalty",
        href: "#",
        header: true,
        icon: undefined,
        roles: [0],
      },
      {
        title: "Point",
        href: "/page/point-loyalty",
        header: false,
        icon: <RiMoneyEuroCircleFill size={25} color={"#fff"} />,
        roles: [
          "d4ead12a-564e-4f32-b5bb-84ccd253f904",
          "548c0702-cc0e-11ee-8e87-38f9d362e2c9", //Admin Marketing
        ],
      },
      {
        title: "Claim Redeem",
        href: "/page/claim-redeem",
        header: false,
        icon: <FaCog size={25} color={"#fff"} />,
        roles: [
          "d4ead12a-564e-4f32-b5bb-84ccd253f904",
          "e2848066-e8fb-11ee-b4f6-38f9d362e2c9", //Agent Redeem
        ],
      },
    ],
    []
  );

  return (
    <aside
      className={`bg-red-700 ${
        opens ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 overflow-scroll scroll-m-5`}
    >
      <div className="relative border-b border-white/20">
        <a className="flex items-center gap-4 py-6 px-8" href="#/">
          <h6 className="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-white">
            Logistic Dashboard
          </h6>
        </a>
        <button
          className="middle none font-sans font-medium text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none w-8 max-w-[32px] h-8 max-h-[32px] rounded-lg text-xs text-white hover:bg-white/10 active:bg-white/30 absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          type="button"
          onClick={closeds}
        >
          <span className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              aria-hidden="true"
              className="h-5 w-5 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </span>
        </button>
      </div>

      <div className="m-4">
        <ul className="mb-4 flex flex-col gap-1">
          <li>
            <a
              aria-current="page"
              className="active"
              onClick={() => router.push("/page/dashboard")}
            >
              <button
                className="middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-white hover:bg-white/10 active:bg-white/30 w-full flex items-center gap-4 px-4 capitalize"
                type="button"
              >
                <MdSpaceDashboard size={25} color={"#fff"} />
                <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">
                  dashboard
                </p>
              </button>
            </a>
          </li>
        </ul>
        <ul className="mb-4 flex flex-col gap-1 ">
          {_.map(SideMenu, (i: any, idx: number) => (
            <li key={idx} className={` ${i.header ? "mx-3.5 mt-4 mb-2" : ""}`}>
              {i.header ? (
                <p className="block antialiased font-sans text-sm leading-normal text-white font-black uppercase opacity-75">
                  {i.title}
                </p>
              ) : (
                <a
                  className={`${
                    _.intersection(i.roles, roles).length > 0
                      ? "block"
                      : "hidden"
                  }`}
                  onClick={() => {
                    router.push(i.href);
                  }}
                >
                  <button
                    className="middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-white hover:bg-white/10 active:bg-white/30 w-full flex items-center gap-4 px-4 capitalize"
                    type="button"
                  >
                    {i.icon}
                    <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">
                      {i.title}
                    </p>
                  </button>
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default SideBar;
