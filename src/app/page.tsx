"use client";
import React from "react";
import moment from "moment";
import Loader from "./component/loader";
import Image from "next/image";
import { FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toastMessage } from "./component/toasttify";
import { Services } from "./utils/services/service";
import { InputAdornment, TextField } from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { customTheme } from "./component/theme";

export default function Home() {
  const router = useRouter();
  const outerTheme = useTheme();
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
      const services = new Services();
      const responseApi = await services.loginUser(formData);

      if (responseApi.status === 200) {
        setLoading(false);
        router.replace("/page/dashboard");
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
          <Image
            className="mx-auto"
            src="/image/logo.png"
            alt="Sahara"
            width={70}
            height={70}
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
            <ThemeProvider theme={customTheme(outerTheme)}>
              <TextField
                name="email"
                id="email"
                label="Email"
                type="email"
                size="small"
                fullWidth
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <div
                        className="text-black"
                        aria-label="toggle password visibility"
                      >
                        <FaEnvelope size={20} />
                      </div>
                    </InputAdornment>
                  ),
                }}
                onChange={handleInputChange}
              />
              <TextField
                name="password"
                id="password"
                label="Password"
                type={isShowPassword ? "text" : "password"}
                size="small"
                fullWidth
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <button
                        className="text-black"
                        aria-label="toggle password visibility"
                        onClick={(e: any) => {
                          e.preventDefault();
                          setShowPassword(!isShowPassword);
                        }}
                      >
                        {isShowPassword ? (
                          <FaEyeSlash size={20} />
                        ) : (
                          <FaEye size={20} />
                        )}
                      </button>
                    </InputAdornment>
                  ),
                }}
                onChange={handleInputChange}
              />
            </ThemeProvider>

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
        &copy; {moment().format("YYYY")} PT. SAHARA BOGATAMA All rights
        reserved.
      </footer>
      <Loader active={loading} />
    </main>
  );
}
