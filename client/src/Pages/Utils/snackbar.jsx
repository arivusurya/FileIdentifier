import { Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";

export default function ShowMessage(props) {
  const { openSnackBar, severity, message, setOpenSnackBar } = props;
  //   const handleClose = () => {
  //     setOpenSnackbar(false);
  //   };
  return (
    <Snackbar
      open={openSnackBar}
      onClose={() => {
        setOpenSnackBar(false);
      }}
      autoHideDuration={6000}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity={severity} variant="filled" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
