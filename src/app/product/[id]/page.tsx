"use client";

import React, { Suspense } from "react";
import _ from "lodash";
import { useRouter } from "next/navigation";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import Loading from "../../loading";
import { AuthService } from "../../utils/services/auth.service";
import { toastMessage } from "../../component/toasttify";
import Loader from "../../component/loader";

interface UserData {
  roleId?: {
    key: number;
  };
}

export default function Page({ params }: { params: { id: string } }) {
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
        items={{ label: "Product", link: `${params.id}` }}
        opens={open}
        data={dataUser}
      />

      <Suspense fallback={<Loading />}>
        <div className="p-4 xl:ml-80 gap-10">
          <form className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
            <h6 className="text-black">Edit Product</h6>
            <div>
              <label
                htmlFor="kodeProduct"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Nama Produk
              </label>
              <div className="mt-2">
                <input
                  id="kodeProduct"
                  name="kodeProduct"
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="flex flex-row gap-5 flex-wrap">
              <div>
                <label
                  htmlFor="kodeProduct"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Kode Product
                </label>
                <div className="mt-2">
                  <input
                    id="kodeProduct"
                    name="kodeProduct"
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="variant"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Variant
                </label>
                <div className="mt-2">
                  <input
                    id="variant"
                    name="variant"
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="variant"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Berat
                </label>
                <div className="mt-2 flex flex-row">
                  <input
                    id="variant"
                    name="variant"
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-row gap-5 my-10">
              <button
                type="submit"
                className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Simpan
              </button>
              <button
                type="submit"
                className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                batal
              </button>
            </div>

            <div className="grid grid-cols-2 grid-rows-2 text-black gap-4">
              <span className="row-start-1">Tanggal disimpan: </span>
              <span className="row-start-2">Tanggal diubah: </span>
              <span className="row-start-1 col-start-2">Disimpan oleh: </span>
              <span className="row-start-2 col-start-2">Diubah oleh: </span>
            </div>
          </form>
        </div>
      </Suspense>

      <Loader active={loading} />
    </main>
  );
}
