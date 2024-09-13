// useSnackbar.tsx
import { useState } from "react";

interface UseSnackbar {
  openSnackbar: (
    message: string,
    severity?: "success" | "error" | "warning" | "info"
  ) => void;
  snackbarProps: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
    onClose: () => void;
  };
}

export const useSnackbar = (): UseSnackbar => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");

  const openSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return {
    openSnackbar,
    snackbarProps: {
      open,
      message,
      severity,
      onClose,
    },
  };
};
