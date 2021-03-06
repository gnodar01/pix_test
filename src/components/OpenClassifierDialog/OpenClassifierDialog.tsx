import React from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from "@mui/material";
import { classifierSlice } from "../../store/slices";
import { Shape } from "../../types/Shape";
import * as tf from "@tensorflow/tfjs";
import { useDispatch } from "react-redux";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import { LayersModel } from "@tensorflow/tfjs";
import { ModelType } from "../../types/ClassifierModelType";

type OpenClassifierDialogProps = {
  onClose: any;
  open: any;
  popupState: any;
};

export const OpenClassifierDialog = ({
  onClose,
  open,
  popupState,
}: OpenClassifierDialogProps) => {
  const [classifierModel, setClassifierModel] = React.useState<LayersModel>();
  const [modelSelected, setModelSelected] = React.useState<boolean>(false);
  const [modelName, setModelName] = React.useState<string>("");
  const [inputShape, setInputShape] = React.useState<Shape>({
    height: 256,
    width: 256,
    channels: 3,
    planes: 1,
    frames: 1,
  });

  const [fileError, setFileError] = React.useState<boolean>(false);
  const [fileErrorMessage, setFileErrorMessage] = React.useState<string>("");

  const dispatch = useDispatch();

  const dispatchModelToStore = () => {
    dispatch(
      classifierSlice.actions.uploadUserSelectedModel({
        inputShape: inputShape,
        modelSelection: {
          modelName: modelName + " - uploaded",
          modelType: ModelType.UserUploaded,
        },
        model: classifierModel as LayersModel,
      })
    );

    onClose();
    popupState.close();
  };

  const onClassifierFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.persist();

    if (!event.currentTarget.files) {
      return;
    }

    let weightsFile, jsonFile;
    if (event.currentTarget.files[0].name.includes(".bin")) {
      weightsFile = event.currentTarget.files[0];
      jsonFile = event.currentTarget.files[1];
    } else {
      weightsFile = event.currentTarget.files[1];
      jsonFile = event.currentTarget.files[0];
    }

    // make sure the weight file required in the json has the correct name
    const jsonFileContent = await jsonFile.text();

    const weightFileName = weightsFile.name;
    const weightFileNameReplaceString =
      'paths":["./' +
      weightFileName.substring(0, weightFileName.length - 4) +
      '.bin"]';

    const regegPattern = new RegExp('paths":\\["./(.)*weights.bin"]');
    const updatedJsonFileContent = jsonFileContent.replace(
      regegPattern,
      weightFileNameReplaceString
    );

    var newJsonFile = new File([updatedJsonFileContent], jsonFile.name, {
      type: jsonFile.type,
    });

    try {
      const model = await tf.loadLayersModel(
        tf.io.browserFiles([newJsonFile, weightsFile])
      );
      setClassifierModel(model);
      setModelSelected(true);

      const modelShape = model.inputs[0].shape.slice(1) as number[];
      setInputShape((prevShape) => ({
        ...prevShape,
        height: modelShape[0],
        width: modelShape[1],
        channels: modelShape[2],
      }));

      // remove the file extension from the model name
      const jsonFileName = jsonFile.name.replace(/\..+$/, "");
      setModelName(jsonFileName);
    } catch (err) {
      const error: Error = err as Error;

      setFileErrorMessage(
        "Invalid files selected:\n" + error.name + "\n" + error.message
      );
      setFileError(true);
    }
  };

  const onCancel = () => {
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="xs" onClose={onClose} open={open}>
      <DialogTitle>Open classifier</DialogTitle>

      <input
        accept="application/json|.bin"
        hidden
        type="file"
        multiple
        id="open-classifier-file"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onClassifierFilesSelected(event)
        }
      />

      <DialogContent>
        <Typography gutterBottom>
          Tensowflow requires a .json files containing the model description as
          well as the corresponding model weights (.bin file).
        </Typography>
      </DialogContent>

      <label htmlFor="open-classifier-file">
        <MenuItem component="span" dense>
          <ListItemIcon>
            <FileOpenIcon />
          </ListItemIcon>
          <ListItemText primary="Select classifier files" />
        </MenuItem>
      </label>

      {fileError ? <Alert severity="error">{fileErrorMessage}</Alert> : <></>}

      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>

        <Button
          onClick={dispatchModelToStore}
          color="primary"
          disabled={!modelSelected}
        >
          Open Classifier
        </Button>
      </DialogActions>
    </Dialog>
  );
};
