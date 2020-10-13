import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Collapse from "@material-ui/core/Collapse";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import Slide from "@material-ui/core/Slide";
import TextField from "@material-ui/core/TextField";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import useTheme from "@material-ui/core/styles/useTheme";

import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FeedbackIcon from "@material-ui/icons/Feedback";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import HelpIcon from "@material-ui/icons/Help";
import LabelIcon from "@material-ui/icons/Label";
import LabelOutlinedIcon from "@material-ui/icons/LabelOutlined";
import MenuIcon from "@material-ui/icons/Menu";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import SaveIcon from "@material-ui/icons/Save";
import SettingsIcon from "@material-ui/icons/Settings";

import React from "react";
import ReactDOM from "react-dom";
import {
  configureStore,
  createAction,
  createReducer,
  PayloadAction,
} from "@reduxjs/toolkit";

import * as serviceWorker from "./serviceWorker";
import state from "./index.json";
import { useStyles } from "./index.css";
import clsx from "clsx";
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from "material-ui-popup-state/hooks";
import { TransitionProps } from "@material-ui/core/transitions";
import { Provider } from "react-redux";
import { v4 } from "uuid";

type Category = {
  color: string;
  id: string;
  name: string;
};

type Photo = {
  category?: string;
  id: string;
  name: string;
  src: string;
};

type State = {
  categories: Array<Category>;
  photos: Array<Photo>;
};

const createCategoryAction = createAction<{ name: string }>("create-category");

const deleteCategoryAction = createAction<{ id: string }>("delete-category");

const updateCategoryNameAction = createAction<{
  category: string;
  name: string;
}>("update-category-name");

const updatePhotoCategoryAction = createAction<{
  photo: string;
  category: string;
}>("update-photo-category");

const reducer = createReducer(state, {
  [createCategoryAction.type]: (
    state: State,
    action: PayloadAction<Category>
  ) => {
    const category: Category = {
      color: "",
      id: v4().toString(),
      name: action.payload.name,
    };

    state.categories.push(category);
  },
  [deleteCategoryAction.type]: (
    state: State,
    action: PayloadAction<{ id: string }>
  ) => {
    return state.categories.filter((category: Category) => {
      return category.id !== action.payload.id;
    });
  },
  [updateCategoryNameAction.type]: (
    state: State,
    action: PayloadAction<{ category: string; name: string }>
  ) => {},
  [updatePhotoCategoryAction.type]: (
    state: State,
    action: PayloadAction<{ photo: string; category: string }>
  ) => {},
});

const store = configureStore({ reducer: reducer });

type CollapsibleListProps = {
  children: any;
  primary: string;
};

const CollapsibleList = ({ children, primary }: CollapsibleListProps) => {
  const [collapsed, setCollapsed] = React.useState(true);

  const onClick = () => {
    setCollapsed(!collapsed);
  };

  return (
    <List dense>
      <ListItem button dense onClick={onClick}>
        <ListItemIcon>
          {collapsed ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemIcon>
        <ListItemText primary={primary} />
      </ListItem>
      <Collapse in={collapsed} timeout="auto" unmountOnExit>
        <List component="div" dense disablePadding>
          {children}
        </List>
      </Collapse>
    </List>
  );
};

const Application = () => {
  /*
   * Drawer
   */
  const [openDrawer, setOpenDrawer] = React.useState(true);

  const onOpenDrawer = () => {
    setOpenDrawer(true);
  };

  const onCloseDrawer = () => {
    setOpenDrawer(false);
  };

  /*
   * New classifier dialog
   */
  const [openNewClassifierDialog, setOpenNewClassifierDialog] = React.useState(
    false
  );

  const onOpenNewClassifierDialog = () => {
    setOpenNewClassifierDialog(true);
  };

  const onCloseNewClassifierDialog = () => {
    setOpenNewClassifierDialog(false);
  };

  const categoryMenuState = usePopupState({
    popupId: "category-menu",
    variant: "popover",
  });

  const openMenuState = usePopupState({
    popupId: "open-menu",
    variant: "popover",
  });

  const photoCategoryMenuState = usePopupState({
    popupId: "photo-category-menu",
    variant: "popover",
  });

  const saveMenuState = usePopupState({
    popupId: "save-menu",
    variant: "popover",
  });

  /*
   * Create category dialog
   */
  const [
    openCreateCategoryDialog,
    setOpenCreateCategoryDialog,
  ] = React.useState(false);

  const onOpenCreateCategoryDialog = () => {
    setOpenCreateCategoryDialog(true);
  };

  const onCloseCreateCategoryDialog = () => {
    setOpenCreateCategoryDialog(false);
  };

  /*
   * Settings dialog
   */
  const [openSettingsDialog, setOpenSettingsDialog] = React.useState(false);

  const onOpenSettingsDialog = () => {
    setOpenSettingsDialog(true);
  };

  const onCloseSettingsDialog = () => {
    setOpenSettingsDialog(false);
  };

  const DialogTransition = React.forwardRef(
    (
      props: TransitionProps & { children?: React.ReactElement },
      ref: React.Ref<unknown>
    ) => {
      return <Slide direction="right" ref={ref} {...props} />;
    }
  );

  const classes = useStyles();

  const theme = useTheme();

  const CategoryMenu = () => {
    return (
      <Menu
        anchorOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
        getContentAnchorEl={null}
        transformOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
        {...bindMenu(categoryMenuState)}
      >
        <MenuList dense variant="menu">
          <MenuItem onClick={categoryMenuState.close}>
            <Typography variant="inherit">Hide other categories</Typography>
          </MenuItem>

          <MenuItem onClick={categoryMenuState.close}>
            <Typography variant="inherit">Hide category</Typography>
          </MenuItem>

          <Divider />

          <MenuItem onClick={categoryMenuState.close}>
            <Typography variant="inherit">Update category</Typography>
          </MenuItem>

          <MenuItem onClick={categoryMenuState.close}>
            <Typography variant="inherit">Delete category</Typography>
          </MenuItem>
        </MenuList>
      </Menu>
    );
  };

  const CreateCategoryDialog = () => {
    return (
      <Dialog
        fullWidth
        onClose={onCloseCreateCategoryDialog}
        open={openCreateCategoryDialog}
      >
        <DialogTitle>Create category</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            id="name"
            label="Name"
            margin="dense"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onCloseCreateCategoryDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={onCloseCreateCategoryDialog} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const NewClassifierDialog = () => {
    return (
      <Dialog
        fullWidth
        onClose={onCloseNewClassifierDialog}
        open={openNewClassifierDialog}
      >
        <DialogTitle>New classifier</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            id="name"
            label="Name"
            margin="dense"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onCloseNewClassifierDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={onCloseNewClassifierDialog} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const OpenMenu = () => {
    return (
      <Menu
        anchorOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
        getContentAnchorEl={null}
        transformOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
        {...bindMenu(openMenuState)}
      >
        <MenuList dense variant="menu">
          <MenuItem onClick={openMenuState.close}>Open classifier</MenuItem>

          <Divider />

          <MenuItem onClick={openMenuState.close}>
            Open example classifier
          </MenuItem>

          <MenuItem onClick={openMenuState.close}>Open weights</MenuItem>
        </MenuList>
      </Menu>
    );
  };

  const PhotoCategoryMenu = () => {
    return (
      <Menu
        anchorOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
        getContentAnchorEl={null}
        transformOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
        {...bindMenu(photoCategoryMenuState)}
      >
        <MenuList dense variant="menu">
          {state.categories.map((category: Category) => (
            <MenuItem key={category.id} onClick={photoCategoryMenuState.close}>
              {category.name}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    );
  };

  const SaveMenu = () => {
    return (
      <Menu
        anchorOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
        getContentAnchorEl={null}
        transformOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
        {...bindMenu(saveMenuState)}
      >
        <MenuList dense variant="menu">
          <MenuItem onClick={saveMenuState.close}>Save classifier</MenuItem>

          <Divider />

          <MenuItem onClick={saveMenuState.close}>
            Open example classifier
          </MenuItem>

          <MenuItem onClick={saveMenuState.close}>Open weights</MenuItem>
        </MenuList>
      </Menu>
    );
  };

  const SettingsDialog = () => {
    return (
      <Dialog
        fullScreen
        onClose={onCloseSettingsDialog}
        open={openSettingsDialog}
        TransitionComponent={DialogTransition}
      >
        <AppBar className={classes.settingsDialogAppBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onCloseSettingsDialog}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Dialog>
    );
  };

  return (
    <React.Fragment>
      <CssBaseline />

      <AppBar
        className={clsx(classes.appBar, { [classes.appBarShift]: openDrawer })}
        position="fixed"
      >
        <Toolbar>
          <IconButton color="inherit" onClick={onOpenDrawer} edge="start">
            <MenuIcon />
          </IconButton>

          <Typography color="inherit" noWrap variant="h6">
            Piximi
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        className={classes.drawer}
        classes={{ paper: classes.drawerPaper }}
        open={openDrawer}
        variant="persistent"
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={onCloseDrawer}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </div>

        <Divider />

        <List dense>
          <ListItem button onClick={onOpenNewClassifierDialog}>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>

            <ListItemText primary="New classifier…" />
          </ListItem>

          <ListItem button {...bindTrigger(openMenuState)}>
            <ListItemIcon>
              <FolderOpenIcon />
            </ListItemIcon>

            <ListItemText primary="Open" />
          </ListItem>

          <ListItem button {...bindTrigger(saveMenuState)}>
            <ListItemIcon>
              <SaveIcon />
            </ListItemIcon>

            <ListItemText primary="Save" />
          </ListItem>
        </List>

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

        <Divider />

        <CollapsibleList primary="Classifier">
          <ListItem button disabled>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>

            <ListItemText primary="Fit" />
          </ListItem>

          <ListItem button disabled>
            <ListItemIcon>
              <FolderOpenIcon />
            </ListItemIcon>

            <ListItemText primary="Evaluate" />
          </ListItem>

          <ListItem button disabled>
            <ListItemIcon>
              <SaveIcon />
            </ListItemIcon>

            <ListItemText primary="Predict" />
          </ListItem>
        </CollapsibleList>

        <Divider />

        <List dense>
          <ListItem button onClick={onOpenSettingsDialog}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>

            <ListItemText primary="Settings" />
          </ListItem>

          <ListItem button disabled>
            <ListItemIcon>
              <FeedbackIcon />
            </ListItemIcon>

            <ListItemText primary="Send feedback" />
          </ListItem>

          <ListItem button disabled>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>

            <ListItemText primary="Help" />
          </ListItem>
        </List>
      </Drawer>

      <main className={clsx(classes.main, { [classes.mainShift]: openDrawer })}>
        <Container className={classes.container} maxWidth="md">
          <GridList className={classes.gridList} cols={4}>
            {state.photos.map((photo: Photo) => (
              <GridListTile key={photo.id}>
                <img alt="" src={photo.src} />

                <GridListTileBar
                  actionIcon={
                    <IconButton
                      className={classes.gridTileBarIconButton}
                      disableRipple
                      {...bindTrigger(photoCategoryMenuState)}
                    >
                      <LabelOutlinedIcon />
                    </IconButton>
                  }
                  actionPosition="left"
                  className={classes.gridTileBar}
                  titlePosition="top"
                />
              </GridListTile>
            ))}
          </GridList>
        </Container>
      </main>

      <CategoryMenu />
      <CreateCategoryDialog />
      <NewClassifierDialog />
      <OpenMenu />
      <PhotoCategoryMenu />
      <SaveMenu />
      <SettingsDialog />
    </React.Fragment>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Application />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

serviceWorker.register();
