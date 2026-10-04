import toast from "react-hot-toast";

if (!toast.info) {
  toast.info = (message, options) => {
    return toast(message, {
      icon: "ℹ️",
      style: {
        borderRadius: "10px",
        background: "#0f172a",
        color: "#93c5fd",
        border: "1px solid #1e3a8a",
      },
      ...options,
    });
  };
}

export { toast };
export default toast;
