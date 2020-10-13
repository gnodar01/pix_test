import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import state from "./index.json";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Checkbox from "@material-ui/core/Checkbox";
import LabelIcon from "@material-ui/icons/Label";
import LabelOutlinedIcon from "@material-ui/icons/LabelOutlined";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import { bindTrigger } from "material-ui-popup-state/hooks";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import AddIcon from "@material-ui/icons/Add";
import DialogContent from "@material-ui/core/DialogContent";
import Container from "@material-ui/core/Container";
import { Canvas } from "react-three-fiber";
import {
  Box,
  OrbitControls,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import React, { ReactElement } from "react";
import { VolumeUp } from "@material-ui/icons";
import { Texture } from "three";
import { CollapsibleList } from "./CollapsibleList";
import { useStyles } from "./index.css";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Slider } from "@material-ui/core";
import Input from "@material-ui/core/Input";
import { Category, Photo } from "./store";
import { TransitionProps } from "@material-ui/core/transitions";

type SliderWithInputFieldProps = {
  icon: ReactElement;
  name: string;
};

const SliderWithInputField = ({ icon, name }: SliderWithInputFieldProps) => {
  const classes = useStyles();

  const [value, setValue] = React.useState<
    number | string | Array<number | string>
  >(30);

  const onBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value === "" ? "" : Number(event.target.value));
  };

  const onSliderChange = (event: any, newValue: number | number[]) => {
    setValue(newValue);
  };

  return (
    <div className={classes.slider}>
      <Typography id="input-slider" gutterBottom>
        {name}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>{icon}</Grid>
        <Grid item xs>
          <Slider
            value={typeof value === "number" ? value : 0}
            onChange={onSliderChange}
            aria-labelledby="input-slider"
          />
        </Grid>
        <Grid item>
          <Input
            className={classes.sliderInput}
            value={value}
            margin="dense"
            onChange={onInputChange}
            onBlur={onBlur}
            inputProps={{
              step: 10,
              min: 0,
              max: 100,
              type: "number",
              "aria-labelledby": "input-slider",
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
};

type ImageMeshProps = {
  brightness: number;
  contrast: number;
  photo?: Photo;
};

const ImageMesh = ({ photo }: ImageMeshProps) => {
  let src = "";

  if (photo) {
    src = photo.src;
  }

  const texture: Texture = useTexture(src) as Texture;

  return (
    <mesh>
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial attach="material" map={texture} />
        {/*  <texture attach="map" image={texture}/>*/}
        {/*</meshStandardMaterial>*/}
      </Box>
    </mesh>
  );
};

type ImageDialogProps = {
  categoryMenuState: any;
  onClose: () => void;
  onOpenCreateCategoryDialog: () => void;
  open: boolean;
  photo?: Photo;
  TransitionComponent?: React.ComponentType<
    TransitionProps & { children?: React.ReactElement<any, any> }
  >;
};

export const ImageDialog = ({
  categoryMenuState,
  onClose,
  onOpenCreateCategoryDialog,
  open,
  photo,
  TransitionComponent,
}: ImageDialogProps) => {
  const classes = useStyles();

  return (
    <Dialog
      fullScreen
      onClose={onClose}
      open={open}
      TransitionComponent={TransitionComponent}
    >
      <AppBar className={classes.imageDialogAppBar} position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        className={classes.drawer}
        classes={{ paper: classes.drawerPaper }}
        variant="permanent"
      >
        <div className={classes.drawerHeader} />
        <Divider />
        <CollapsibleList primary="Categories">
          <>
            {state.categories.map((category: Category) => {
              return (
                <ListItem dense key={category.id}>
                  <ListItemIcon>
                    <Checkbox
                      checked
                      checkedIcon={<LabelIcon />}
                      disableRipple
                      edge="start"
                      icon={<LabelOutlinedIcon />}
                      tabIndex={-1}
                    />
                  </ListItemIcon>

                  <ListItemText id={category.id} primary={category.name} />

                  <ListItemSecondaryAction>
                    <IconButton edge="end" {...bindTrigger(categoryMenuState)}>
                      <MoreHorizIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}

            <ListItem button onClick={onOpenCreateCategoryDialog}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>

              <ListItemText primary="Create category" />
            </ListItem>
          </>
        </CollapsibleList>
      </Drawer>
      <DialogContent className={classes.imageDialogContent}>
        <Container fixed maxWidth="sm">
          <Canvas
            //camera={{fov: 80, near:0.1, far:5000, position: [0, 0, 1000] }}
            colorManagement={false}
            onCreated={({ gl }) => {
              gl.setClearColor("black");
            }}
          >
            <PerspectiveCamera makeDefault position={[0, 0, 2]} />
            {/*<TransformControls mode={"translate"}>*/}
            <React.Suspense fallback={null}>
              {photo ? (
                <ImageMesh brightness={0.0} contrast={1.0} photo={photo} />
              ) : (
                <React.Fragment />
              )}
            </React.Suspense>
            {/*</TransformControls>*/}
            <OrbitControls enableRotate={false} />
          </Canvas>
        </Container>
      </DialogContent>
      <Drawer
        anchor="right"
        className={classes.drawer}
        classes={{ paper: classes.drawerPaper }}
        variant="permanent"
      >
        <div className={classes.drawerHeader} />
        <Divider />
        <SliderWithInputField icon={<VolumeUp />} name="Brightness" />
      </Drawer>
    </Dialog>
  );
};