import * as React from "react";
import { CirclePicker, ColorResult } from "react-color";
import { availableColorsSelector } from "../../store/selectors/availableColorsSelecor";
import { Avatar, IconButton, Popover, Box } from "@mui/material";
import { Label } from "@mui/icons-material";
import { useSelector } from "react-redux";

type ColorIconButtonProps = {
  color: string;
  onColorChange: (color: any) => void;
};

export const ColorIcon = ({ color, onColorChange }: ColorIconButtonProps) => {
  const availableColors = useSelector(availableColorsSelector);

  const [colorMenuAnchorEl, setColorMenuAnchorEl] =
    React.useState<null | HTMLButtonElement>(null);

  const colorPopupOpen = Boolean(colorMenuAnchorEl);

  const onOpenColorPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    setColorMenuAnchorEl(event.currentTarget);
  };

  const onCloseColorPicker = () => {
    setColorMenuAnchorEl(null);
  };

  const onChange = (color: ColorResult) => {
    console.info(color);
    onColorChange(color);
    onCloseColorPicker();
  };

  return (
    <React.Fragment>
      <IconButton onClick={onOpenColorPicker}>
        <Avatar sx={{ backgroundColor: "#F3F3F3" }}>
          <Label sx={{ color: color }} />
        </Avatar>
      </IconButton>
      <Popover
        id="color-menu"
        open={colorPopupOpen}
        anchorEl={colorMenuAnchorEl}
        onClose={onCloseColorPicker}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box sx={{ margin: "16px" }}>
          <CirclePicker colors={availableColors} onChange={onChange} />
        </Box>
      </Popover>
    </React.Fragment>
  );
};
