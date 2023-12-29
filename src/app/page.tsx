"use client";
import React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { AuthService } from "./utils/services/auth.service";
import { ToastContainer } from "react-toastify";
import Loader from "./component/loader";
import { toastMessage } from "./component/toasttify";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [isShowPassword, setShowPassword] = React.useState<boolean>(false);

  // Define state variables for form fields
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  // Handle form field changes
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authService = new AuthService();
      const responseApi = await authService.login(formData);

      if (responseApi.data.result === "OK") {
        setLoading(false);
        router.replace("/dashboard");
      }
    } catch (e: any) {
      setLoading(false);
      if (e.response && e.response.status === 500) {
        toastMessage({ message: e.response.data.message, type: "error" });
      } else {
        toastMessage({ message: e.message, type: "error" });
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-24 flex-col  bg-white dark:bg-white">
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-32 w-auto"
            src="/image/logo.png"
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            className="space-y-6"
            action="#"
            method="POST"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
              </div>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={isShowPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 px-3  text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  onChange={handleInputChange}
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => {
                    setShowPassword(!isShowPassword);
                  }}
                >
                  {isShowPassword ? (
                    <FaEyeSlash className="mx-auto h-5 w-auto" color="black" />
                  ) : (
                    <FaEye className="mx-auto h-5 w-auto" color="black" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="bg-white text-black text-center py-4">
        &copy; 2023 PT. SAHARA BOGATAMA All rights reserved.
      </footer>
      <Loader active={loading} />
    </main>
  );
}
