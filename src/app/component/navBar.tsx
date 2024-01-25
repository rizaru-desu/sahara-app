import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaPowerOff, FaUserCircle } from "react-icons/fa";
import { BsFillMenuButtonWideFill } from "react-icons/bs";
import { toastMessage } from "./toasttify";
import { AuthService } from "../utils/services/auth.service";

import Loader from "./loader";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import _ from "lodash";

function NavBar({
  items,
  opens,
  data,
}: {
  items: any;
  opens: () => void;
  data?: any;
}) {
  const router = useRouter();
  const params = usePathname();
  const [loading, setLoading] = React.useState(false);

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

  const pathSegments = params.split("/").filter((segment) => segment !== "");

  const toTitleCase = (str: any) => {
    return str.replace(/\b\w/g, (char: any) => char.toUpperCase());
  };

  const handleClick = (index: any) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    router.push(path);
  };

  return (
    <div className="p-4 xl:ml-80">
      <nav className="block w-full max-w-full bg-transparent text-white shadow-none rounded-xl transition-all px-0 py-1">
        <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
          <Breadcrumbs aria-label="breadcrumb">
            {pathSegments.map((segment, index) => {
              const isLast = index === pathSegments.length - 1;
              const linkPath = `/${pathSegments.slice(0, index + 1).join("/")}`;

              const title = toTitleCase(segment);

              return isLast ? (
                <Typography key={index} color="text.primary">
                  {title}
                </Typography>
              ) : (
                <Link
                  key={index}
                  underline="hover"
                  color="inherit"
                  href={linkPath}
                  //onClick={() => handleClick(index)}
                >
                  {title}
                </Link>
              );
            })}
          </Breadcrumbs>
          {/* <div className="capitalize">
            <nav aria-label="breadcrumb" className="w-max">
              <ol className="flex flex-wrap items-center w-full bg-opacity-60 rounded-md bg-transparent p-0 transition-all">
                <li className="flex items-center text-blue-gray-900 antialiased font-sans text-sm font-normal leading-normal cursor-pointer transition-colors duration-300 hover:text-light-blue-500">
                  <button
                    onClick={() => {
                      router.replace(items.link);
                    }}
                  >
                    <p className="block antialiased font-sans text-sm leading-normal text-blue-900 font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100">
                      {items.label}
                    </p>
                  </button>
                  <span className="text-gray-500 text-sm antialiased font-sans font-normal leading-normal mx-2 pointer-events-none select-none">
                    /
                  </span>
                </li>
                <li className="flex items-center text-blue-900 antialiased font-sans text-sm font-normal leading-normal cursor-pointer transition-colors duration-300 hover:text-blue-500">
                  <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-900 font-normal">
                    {items.link}
                  </p>
                </li>
              </ol>
            </nav>
            <h6 className="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-gray-900">
              {items.label}
            </h6>
          </div> */}
          <div className="flex items-center">
            <button
              className="relative middle none font-sans font-medium text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none w-10 max-w-[40px] h-10 max-h-[40px] rounded-lg text-xs text-gray-500 hover:bg-blue-gray-500/10 active:bg-blue-gray-500/30 grid xl:hidden"
              type="button"
              onClick={opens}
            >
              <span className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                <BsFillMenuButtonWideFill size={15} color={"#000"} />
              </span>
            </button>
            <span>
              <span className="flex flex-row middle none font-sans font-bold center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-gray-500 hover:bg-blue-gray-500/10 active:bg-blue-gray-500/30  items-center gap-1 px-4 xl:flex">
                <FaUserCircle size={15} color={"#000"} />
                {data?.fullname} [{data?.roleId?.value}]
              </span>
            </span>

            <button
              onClick={() => {
                logoutUser();
              }}
            >
              <span className="flex flex-row middle none font-sans font-bold center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-gray-500 hover:bg-blue-gray-500/10 active:bg-blue-gray-500/30  items-center gap-1 px-4 xl:flex">
                <FaPowerOff size={15} color={"#000"} />
                Log Out
              </span>
            </button>
          </div>
        </div>
      </nav>

      <Loader active={loading} />
    </div>
  );
}

export default NavBar;
