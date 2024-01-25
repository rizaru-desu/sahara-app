/* eslint-disable @next/next/no-img-element */
"use client";

import React, { Suspense } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Dialog, DialogContent, Pagination } from "@mui/material";
import { useRouter } from "next/navigation";
import { AuthService } from "@/app/utils/services/auth.service";
import { toastMessage } from "@/app/component/toasttify";
import { CustomerService } from "@/app/utils/services/agent.service";
import { FaEdit } from "react-icons/fa";
import _ from "lodash";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import ImageViewer from "awesome-image-viewer";
import Loading from "@/app/loading";
import Loader from "@/app/component/loader";
import moment from "moment";
import Backdrop from "@mui/material/Backdrop";

interface UserData {
  fullname: string;
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
  const [openAddBooth, setOpenAddBooth] = React.useState(false);

  const [isTotalPage, setTotalPage] = React.useState(0);
  const [isCurrentPage, setCurrentPage] = React.useState(1);
  const [isAllDataBooth, setAllDataBooth] = React.useState([]);

  const [formData, setFormData] = React.useState({
    alamatBooth: "",
    latlong: "",
  });

  const [file, setFile] = React.useState<File | null>(null);

  const [disableSubmit, setDisableSubmit] = React.useState<false | true>(
    Boolean
  );

  const [inputValue, setInputValue] = React.useState("");

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

  const getCurrentListBooth = React.useCallback(
    async ({ skip, take }: { skip: number; take: number }) => {
      try {
        setLoading(true);
        const customerService = new CustomerService();
        const responseApi = await customerService.getBooth({
          skip,
          take,
          agentId: params.id,
        });

        if (responseApi.status === 200) {
          const { data, count } = responseApi.data;
          setLoading(false);
          setAllDataBooth(data);
          setTotalPage(Math.ceil(count / 100));
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
    [logoutUser, params.id]
  );

  const searchBooth = React.useCallback(
    async ({ value }: { value: any }) => {
      try {
        setLoading(true);
        const customerService = new CustomerService();

        const responseApi = await customerService.searchBooth({
          value,
        });

        if (responseApi.status === 200) {
          const { data } = responseApi.data;
          setLoading(false);
          setAllDataBooth(data);
          setTotalPage(1);
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

  const addBooth = React.useCallback(
    async ({ formData }: { formData: any }) => {
      try {
        setLoading(true);
        const customerService = new CustomerService();

        const responseApi = await customerService.addBooth({ data: formData });

        if (responseApi.status === 200) {
          const { message } = responseApi.data;
          setLoading(false);
          toastMessage({
            message: message,
            type: "success",
          });
          getCurrentListBooth({ skip: 0, take: 100 });
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
    [getCurrentListBooth, logoutUser]
  );

  React.useEffect(() => {
    detailUser();
    getCurrentListBooth({ skip: 0, take: 100 });
  }, [detailUser, getCurrentListBooth]);

  const handleChange = async (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
    getCurrentListBooth({ skip: Math.max(0, (value - 1) * 100), take: 100 });
  };

  const handleInputSearchChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleSubmitSearch = (event: any) => {
    event.preventDefault();

    if (!_.isEmpty(inputValue)) {
      searchBooth({ value: inputValue });
    } else {
      toastMessage({ message: "Please input value search...", type: "error" });
    }
  };

  const handleInputChangeBooth = (e: any) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const selectedFile = event.currentTarget.files?.[0];
    if (selectedFile) {
      const maxSize = 500 * 1024;
      if (selectedFile.size > maxSize) {
        setDisableSubmit(true);
        toastMessage({
          message: "File size exceeds the maximum limit of 500kb.",
          type: "error",
        });
      } else {
        setDisableSubmit(false);
        setFile(selectedFile);
      }
    }
  };

  const handleSubmitAddBooth = async (event: any) => {
    event.preventDefault();

    const dataForm = new FormData();
    if (file) {
      dataForm.append("photoBooth", file);
      dataForm.append("alamatBooth", formData?.alamatBooth);
      dataForm.append("createBy", dataUser?.fullname || "");
      dataForm.append("agentId", params.id);
      dataForm.append("latlong", formData?.latlong);

      addBooth({ formData: dataForm });
    }
  };

  const handleClose = () => {
    setOpenAddBooth(false);
  };
  const handleOpen = () => {
    setOpenAddBooth(true);
  };

  return (
    <main className="dark:bg-white bg-white min-h-screen">
      <SideBar opens={menuOpen} closeds={open} roles={dataUser?.roleId?.key} />
      <NavBar
        items={{ label: "Booth", link: params.id }}
        opens={open}
        data={dataUser}
      />

      <Suspense fallback={<Loading />}>
        <div className="p-4 xl:ml-80 gap-5">
          <form className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
            <h6 className="text-black text-bold">
              <strong>Edit Agent</strong>
            </h6>

            <div className="grid grid-cols-2 grid-rows-4 place-content-evenly gap-3">
              <div>
                <label
                  htmlFor="namaUsaha"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nama Pengusaha
                </label>
                <div className="mt-2">
                  <input
                    id="namaUsaha"
                    name="namaUsaha"
                    type="text"
                    required
                    placeholder="example: PT. ..../CV. ..../etc"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="namaMerek"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nama Merek
                </label>
                <div className="mt-2">
                  <input
                    id="namaMerek"
                    name="namaMerek"
                    type="text"
                    required
                    placeholder="example: Kebab Enak/etc"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lamaUsaha"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Lama Usaha (Bulan)
                </label>
                <div className="mt-2">
                  <input
                    id="lamaUsaha"
                    name="lamaUsaha"
                    type="number"
                    min={0}
                    required
                    placeholder="example: 10 bulan"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="totalBooth"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Total Booth
                </label>
                <div className="mt-2">
                  <input
                    id="totalBooth"
                    name="totalBooth"
                    type="number"
                    min={0}
                    required
                    placeholder="example: 10"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="instagram"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Instagram
                </label>
                <div className="mt-2">
                  <input
                    id="instagram"
                    name="instagram"
                    type="text"
                    placeholder="Url: https://www.instagram.com/kebab.official"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="facebook"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  facebok
                </label>
                <div className="mt-2">
                  <input
                    id="facebook"
                    name="facebook"
                    type="text"
                    placeholder="Url: https://www.facebook.com/kebab.official"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="col-span-2 place-self-center">
                <label
                  htmlFor="ecommerce"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  e-commerce
                </label>
                <div className="mt-2">
                  <input
                    id="ecommerce"
                    name="ecommerce"
                    type="text"
                    placeholder="Url E-Commerce"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
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
          </form>

          <div className="m-10 flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <form
                className="flex flex-row items-center m-[2px] mb-3"
                action="#"
                method="POST"
                onSubmit={handleSubmitSearch}
              >
                <div className="relative mr-5 float-left">
                  <label htmlFor="inputSearch" className="sr-only">
                    Search{" "}
                  </label>
                  <input
                    id="inputSearch"
                    type="text"
                    placeholder="Search ..."
                    className="block w-[280px] text-black placeholder:text-black rounded-lg dark:border-red-700 border-2 py-2 pl-10 pr-4 text-sm focus:border-red-900 focus:outline-none focus:ring-1 focus:ring-red-900"
                    minLength={3}
                    onChange={handleInputSearchChange}
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-4 w-4 text-red-700 dark:text-red-700"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                  </span>
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                  >
                    Search
                  </button>
                </div>
              </form>

              <button
                onClick={handleOpen}
                className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Add Booth
              </button>
            </div>

            <DataGrid
              pagination={true}
              autoHeight
              rowSelection={false}
              getRowHeight={() => "auto"}
              rows={isAllDataBooth}
              columns={[
                {
                  field: "actions",
                  headerName: "Actions",
                  type: "actions",
                  minWidth: 100,
                  align: "center",
                  headerAlign: "center",
                  hideSortIcons: true,
                  disableColumnMenu: true,
                  renderCell: (params) => {
                    return <FaEdit size={25} />;
                  },
                },
                {
                  field: "alamatBooth",
                  headerName: "Alamat Booth",
                  minWidth: 150,
                  width: 500,
                  align: "left",
                  headerAlign: "center",
                },
                {
                  field: "photo",
                  headerName: "Photo",
                  minWidth: 150,
                  align: "center",
                  headerAlign: "center",
                  hideSortIcons: true,
                  disableColumnMenu: true,
                  renderCell: (params) => {
                    const onClick = (e: any) => {
                      e.stopPropagation();

                      new ImageViewer({
                        images: [
                          {
                            mainUrl: params.value
                              ? params.value
                              : `${window.location.origin}/image/placeholder_image.png`,
                          },
                        ],
                        showThumbnails: false,
                        isZoomable: false,
                        stretchImages: false,
                      });
                    };

                    return (
                      <button className="m-4" onClick={onClick}>
                        <img
                          src={params.value}
                          className="mx-auto h-40 w-40 object-cover"
                          alt="Image Alt Text"
                          loading="lazy"
                        />
                      </button>
                    );
                  },
                },
                {
                  field: "createBy",
                  headerName: "Create By",
                  minWidth: 150,
                  editable: false,
                },
                {
                  field: "createdAt",
                  headerName: "Created At",
                  headerAlign: "center",
                  minWidth: 150,
                  editable: false,
                  renderCell: (params) => {
                    return (
                      <span className="text-black">
                        {moment(params.value).format("DD-MM-YYYY hh:mm")}
                      </span>
                    );
                  },
                },
                {
                  field: "modifiedBy",
                  headerName: "Modified By",
                  headerAlign: "center",
                  minWidth: 150,
                  editable: false,
                },
                {
                  field: "modifedAt",
                  headerName: "Modifed At",
                  headerAlign: "center",
                  minWidth: 150,
                  editable: false,
                  renderCell: (params) => {
                    return (
                      <span className="text-black">
                        {moment(params.value).format("DD-MM-YYYY hh:mm")}
                      </span>
                    );
                  },
                },
              ]}
            />

            <div className="flex justify-center py-4">
              <Pagination
                count={isTotalPage}
                page={isCurrentPage}
                onChange={handleChange}
                shape="rounded"
              />
            </div>
          </div>
        </div>

        <Dialog
          open={openAddBooth}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            component: "form",
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const dataForm = new FormData();
              if (file) {
                dataForm.append("photoBooth", file);
                dataForm.append("alamatBooth", formData?.alamatBooth);
                dataForm.append("createBy", dataUser?.fullname || "");
                dataForm.append("agentId", params.id);
                dataForm.append("latlong", formData?.latlong);

                addBooth({ formData: dataForm });
              }
              handleClose();
            },
          }}
        >
          <DialogContent className="bg-white w-full gap-5 max-w-3xl mx-auto px-4 lg:px-6 py-8 shadow-md rounded-md flex flex-col">
            <h6 className="text-black text-bold">
              <strong>Add Booth</strong>
            </h6>

            <div className="grid grid-cols-2 place-content-evenly gap-3">
              <div>
                <label
                  htmlFor="alamatBooth"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Alamat Booth
                </label>
                <div className="mt-2">
                  <input
                    id="alamatBooth"
                    name="alamatBooth"
                    type="text"
                    required
                    placeholder="example: Jl. Srilanke ..."
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    onChange={handleInputChangeBooth}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="latlong"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Latitude & Longitude
                </label>
                <div className="mt-2">
                  <input
                    id="latlong"
                    name="latlong"
                    type="text"
                    required
                    placeholder="example: -6.213749,106.5452404"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    onChange={handleInputChangeBooth}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="files"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Photo
                </label>
                <div className="mt-2">
                  <input
                    id="files"
                    name="files"
                    type="file"
                    required
                    accept=".jpg, .jpeg, .png"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-700 sm:text-sm sm:leading-6"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={disableSubmit}
              className="flex justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:bg-red-300"
            >
              Simpan
            </button>
          </DialogContent>
        </Dialog>
      </Suspense>

      <Loader active={loading} />
    </main>
  );
}
