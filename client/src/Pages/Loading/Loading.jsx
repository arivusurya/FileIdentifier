import Backdrop from "@mui/material/Backdrop";
import { Discuss } from "react-loader-spinner";

export default function Loading(props) {
  const { loading } = props;
  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <div style={{ transform: "rotate(290deg)" }}>
          <Discuss
            visible={true}
            height="80"
            width="80"
            ariaLabel="discuss-loading"
            wrapperStyle={{}}
            wrapperClass="discuss-wrapper"
            colors={["#a991f5", "#b8c9f7"]}
            backgroundColor="#F4442E"
          />
        </div>
      </Backdrop>
    </>
  );
}
