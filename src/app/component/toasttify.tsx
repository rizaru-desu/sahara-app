import { toast } from "react-toastify";

type ToastType = "error" | "success" | "info" | "warning";

export const toastMessage = ({
  message,
  type,
}: {
  message: string;
  type: ToastType;
}) => {
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
      return toast.success(message);
    case "info":
      return toast.info(message);
    case "warning":
      return toast.warning(message);
    default:
      return toast.info(message);
  }
};
