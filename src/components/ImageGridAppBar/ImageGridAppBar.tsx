import React from "react";
import { useStyles } from "./ImageGridAppBar.css";
import { useDispatch, useSelector } from "react-redux";
import { ImageCategoryMenu } from "../ImageCategoryMenu";
import {
  selectedImagesSelector,
  visibleImagesSelector,
} from "../../store/selectors";
import { applicationSlice } from "../../store/slices";
import { useDialog } from "../../hooks";
import { DeleteImagesDialog } from "../DeleteImagesDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  AppBar,
  Chip,
  IconButton,
  Slide,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import ViewComfyIcon from "@mui/icons-material/ViewComfy";
import GestureIcon from "@mui/icons-material/Gesture";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import ClearIcon from "@mui/icons-material/Clear";

export const ImageGridAppBar = () => {
  const dispatch = useDispatch();

  const images = useSelector(visibleImagesSelector);

  const selectedImages: Array<string> = useSelector(selectedImagesSelector);

  const [openImageDialog, setOpenImageDialog] = React.useState(false);

  const [categoryMenuAnchorEl, setCategoryMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const { onClose, onOpen, open } = useDialog();

  const onOpenCategoriesMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    setCategoryMenuAnchorEl(event.currentTarget);
  };

  const onCloseCategoryMenu = () => {
    setCategoryMenuAnchorEl(null);
  };

  const onOpenImageDialog = (event: React.MouseEvent<HTMLDivElement>) => {
    setOpenImageDialog(true);
  };

  const onCloseImageDialog = () => {
    setOpenImageDialog(false);
  };

  const classes = useStyles();

  const selectAllImages = () => {
    const newSelected = images.map((image) => image.id);
    dispatch(applicationSlice.actions.selectAllImages({ ids: newSelected }));
  };

  const selectNoImages = () => {
    dispatch(applicationSlice.actions.clearSelectedImages());
  };

  return (
    <>
      <Slide appear={false} direction="down" in={selectedImages.length > 0}>
        <AppBar color="inherit" position="fixed">
          <Toolbar>
            <IconButton
              className={classes.closeButton}
              edge="start"
              color="inherit"
              onClick={selectNoImages}
            >
              <ClearIcon />
            </IconButton>

            <Typography className={classes.count}>
              {selectedImages.length} selected images
            </Typography>

            <div style={{ flexGrow: 1 }} />

            <Chip
              avatar={<LabelOutlinedIcon color="inherit" />}
              label="Categorise"
              onClick={onOpenCategoriesMenu}
              variant="outlined"
              style={{ marginRight: 15 }}
            />
            <Chip
              avatar={<GestureIcon color="inherit" />}
              label="Annotate"
              onClick={onOpenImageDialog}
              variant="outlined"
            />

            <IconButton color="inherit" onClick={selectAllImages}>
              <ViewComfyIcon />
            </IconButton>

            <Tooltip title="Delete">
              <IconButton color="inherit" onClick={onOpen}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      </Slide>

      {/*{Array.isArray(selectedImages) && selectedImages.length ? (*/}
      {/*  <ImageDialog*/}
      {/*    image={_.find(images, (image) => image.id === selectedImages[0])!}*/}
      {/*    onClose={onCloseImageDialog}*/}
      {/*    open={openImageDialog}*/}
      {/*  />*/}
      {/*) : null}*/}

      <ImageCategoryMenu
        anchorEl={categoryMenuAnchorEl as HTMLElement}
        imageIds={selectedImages}
        onClose={onCloseCategoryMenu}
      />

      <DeleteImagesDialog
        imageIds={selectedImages}
        onClose={onClose}
        open={open}
      />
    </>
  );
};
