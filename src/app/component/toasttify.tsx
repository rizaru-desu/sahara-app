import { toast } from "react-toastify";

type ToastType = "error" | "success" | "info" | "warning";

export const toastMessage = ({
  message,
  type,
}: {
  message: string;
  type: ToastType;
}) => {
  getToastFunction(type, message);
};

const getToastFunction = (type: ToastType, message: string) => {
  switch (type) {
    case "error":
      return toast(
        () => (
          <div className="flex flex-col gap-2">
            <p className="text-white text-sm text-justify overflow-y-auto p-2 max-h-[160px]">
              {message}
            </p>
          </div>
        ),
        { style: { backgroundColor: "#e74c3c" } }
      );
    case "success":
      return toast.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    case "info":
      return toast.info(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    case "warning":
      return toast.warning(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    default:
      return toast.info(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      }); // Default to info for unknown types
  }
};
