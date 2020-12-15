import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  container: {
    bottom: 0,
    height: 512,
    left: 0,
    position: "fixed",
    right: 0,
    top: 0,
    width: 512,
    zIndex: 10,
    backgroundColor: "#CCC",
    cursor: "crosshair",
  },
  selection: {
    display: "block",
    height: "100%",
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 10,
  },
  anchorpoints: {
    display: "block",
    height: "100%",
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 11,
  },
  image: {
    display: "block",
    height: "100%",
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 9,
  },
  interface: {
    display: "block",
    height: "100%",
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 15,
  },
  temporary: {
    display: "block",
    height: "100%",
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 12,
  },
}));
