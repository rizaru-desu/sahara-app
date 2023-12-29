import React from "react";
import { useRouter } from "next/navigation";
import { FaPowerOff, FaUserCircle } from "react-icons/fa";
import { BsFillMenuButtonWideFill } from "react-icons/bs";

function NavBar({ items, opens }: { items: any; opens: () => void }) {
  const router = useRouter();

  return (
    <div className="p-4 xl:ml-80">
      <nav className="block w-full max-w-full bg-transparent text-white shadow-none rounded-xl transition-all px-0 py-1">
        <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
          <div className="capitalize">
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
          </div>
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
                Developer [ADMIN]
              </span>
            </span>

            <button>
              <span className="flex flex-row middle none font-sans font-bold center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-gray-500 hover:bg-blue-gray-500/10 active:bg-blue-gray-500/30  items-center gap-1 px-4 xl:flex">
                <FaPowerOff size={15} color={"#000"} />
                Log Out
              </span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
