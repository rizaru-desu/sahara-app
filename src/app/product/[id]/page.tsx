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
import { ProductService } from "@/app/utils/services/product.service";
import moment from "moment";

interface UserData {
  fullname?: string;
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

  const [formDataProduct, setFormDataProduct] = React.useState({
    productName: "",
    productCode: "",
    price: 0,
    weight: 0,
    unit: "",
    expiredPeriod: 0,
    createBy: "",
    modifiedBy: "",
    createdAt: undefined,
    modifedAt: undefined,
  });

  const open = React.useCallback(() => {
    isMenuOpen(!menuOpen);
  }, [menuOpen]);

  const logoutUser = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new AuthService();
      const responseApi = await authService.logout();

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

  const detailUser = React.useCallback(async () => {
    try {
      setLoading(true);
      const authService = new AuthService();
      const responseApi = await authService.userDetail();

      if (responseApi.status === 200) {
        const { data } = responseApi.data;
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

  const findProduct = React.useCallback(async () => {
    try {
      setLoading(true);
      const productService = new ProductService();
      const responseApi = await productService.findProduct({
        productId: params.id,
      });

      if (responseApi.status === 200) {
        const { data } = responseApi.data;
        setLoading(false);
        setFormDataProduct(data);
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
  }, [logoutUser, params.id]);

  const updateProduct = React.useCallback(
    async ({
      productId,
      productName,
      modifiedBy,
    }: {
      productId: string;
      productName: string;
      modifiedBy?: string;
    }) => {
      try {
        setLoading(true);
        const productService = new ProductService();
        const responseApi = await productService.updateProduct({
          productId,
          productName,

          modifiedBy,
        });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          setTimeout(() => {
            location.reload();
          }, 3000);
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

  React.useEffect(() => {
    detailUser();
    findProduct();
  }, [detailUser, findProduct]);

  const handleInputChangeProduct = (e: any) => {
    const { name, value } = e.target;

    setFormDataProduct((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitAddProduct = (event: any) => {
    event.preventDefault();

    const { productName } = formDataProduct;

    updateProduct({
      productName,
      productId: params.id,
      modifiedBy: dataUser?.fullname,
    });
  };

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
          <form
            className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col"
            onSubmit={handleSubmitAddProduct}
          >
            <h6 className="text-black text-bold">
              <strong>Update Product</strong>
            </h6>

            <div>
              <label
                htmlFor="productName"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Product Name
              </label>
              <div className="mt-2">
                <input
                  id="productName"
                  name="productName"
                  type="text"
                  required
                  value={formDataProduct.productName}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  onChange={handleInputChangeProduct}
                />
              </div>
            </div>

            <div className="flex flex-row gap-5 flex-wrap">
              <div>
                <label
                  htmlFor="productCode"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Product Code
                </label>
                <div className="mt-2">
                  <input
                    id="productCode"
                    name="productCode"
                    type="text"
                    disabled
                    value={formDataProduct.productCode}
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6 disabled:ring-gray-300"
                    onChange={handleInputChangeProduct}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Price (Rupiah)
                </label>
                <div className="mt-2">
                  <input
                    id="price"
                    name="price"
                    type="number"
                    disabled
                    value={formDataProduct.price}
                    placeholder="Example: 10000"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6 disabled:ring-gray-300"
                    onChange={handleInputChangeProduct}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Weight (Kg)
                </label>
                <div className="mt-2 flex flex-row">
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    disabled
                    step="0.1"
                    placeholder="example: 0.1"
                    value={formDataProduct.weight}
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6 disabled:ring-gray-300"
                    onChange={handleInputChangeProduct}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="unit"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Unit
                </label>
                <div className="mt-2 flex flex-row">
                  <input
                    id="unit"
                    name="unit"
                    type="text"
                    disabled
                    value={formDataProduct.unit}
                    placeholder="example: Pack/etc"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6 disabled:ring-gray-300"
                    onChange={handleInputChangeProduct}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="expiredPeriod"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Expired Period (day)
                </label>
                <div className="mt-2 flex flex-row">
                  <input
                    id="expiredPeriod"
                    name="expiredPeriod"
                    type="number"
                    disabled
                    value={formDataProduct.expiredPeriod}
                    placeholder="example: 20"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6 disabled:ring-gray-300"
                    onChange={handleInputChangeProduct}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            >
              Simpan
            </button>

            <div className="grid grid-cols-2 grid-rows-2 text-black gap-4">
              <span className="row-start-1">
                Tanggal disimpan:{" "}
                {moment(formDataProduct.createdAt)
                  .local()
                  .format("DD MMMM YYYY HH:mm")}
              </span>
              <span className="row-start-2">
                Tanggal diubah:{" "}
                {moment(formDataProduct.modifedAt)
                  .local()
                  .format("DD MMMM YYYY HH:mm")}
              </span>
              <span className="row-start-1 col-start-2">
                Disimpan oleh: {formDataProduct.createBy}{" "}
              </span>
              <span className="row-start-2 col-start-2">
                Diubah oleh: {formDataProduct.modifiedBy}{" "}
              </span>
            </div>
          </form>
        </div>
      </Suspense>

      <Loader active={loading} />
    </main>
  );
}
