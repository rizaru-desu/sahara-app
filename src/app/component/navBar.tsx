import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaPowerOff, FaUserCircle } from "react-icons/fa";
import { BsFillMenuButtonWideFill } from "react-icons/bs";
import { toastMessage } from "./toasttify";
import { Services } from "../utils/services/service";
import Loader from "./loader";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import _ from "lodash";

function NavBar({ opens, data }: { opens: () => void; data?: any }) {
  const router = useRouter();
  const params = usePathname();
  const [loading, setLoading] = React.useState(false);

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

  const pathSegments = params.split("/").filter((segment) => segment !== "");

  const updatedPathSegments = _.without(pathSegments, "page");

  const toTitleCase = (str: any) => {
    return str.replace(/\b\w/g, (char: any) => char.toUpperCase());
  };

  return (
    <div className="p-4 xl:ml-80">
      <nav className="block w-full max-w-full bg-transparent text-white shadow-none rounded-xl transition-all px-0 py-1">
        <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
          <Breadcrumbs aria-label="breadcrumb">
            {updatedPathSegments.map((segment, index) => {
              const isLast = index === updatedPathSegments.length - 1;
              const linkPath = `/${updatedPathSegments
                .slice(0, index + 1)
                .join("/")}`;

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
                >
                  {title}
                </Link>
              );
            })}
          </Breadcrumbs>

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
                {data?.fullname}
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
