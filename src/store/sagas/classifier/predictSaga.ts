import { put, select } from "redux-saga/effects";
import { projectSlice } from "../../slices";
import { createdCategoriesSelector } from "../../selectors";
import { rescaleOptionsSelector } from "../../selectors/rescaleOptionsSelector";
import { preprocess_predict } from "../../coroutines/classifier/preprocess_predict";
import { predictCategories } from "../../coroutines/classifier/predictCategories";
import { testImagesSelector } from "../../selectors/testImagesSelector";
import { fittedSelector } from "../../selectors/fittedSelector";
import { architectureOptionsSelector } from "../../selectors/architectureOptionsSelector";
import { Category } from "../../../types/Category";

export function* predictSaga(action: any): any {
  const rescaleOptions = yield select(rescaleOptionsSelector);

  let model = yield select(fittedSelector);

  const architectureOptions = yield select(architectureOptionsSelector);

  const categories: Category[] = yield select(createdCategoriesSelector);

  const testImages = yield select(testImagesSelector);

  if (!testImages.length) {
    alert("No unlabled images to predict!");
    return;
  }

  const outputLayerSize = model.outputs[0].shape[1] as number;
  if (outputLayerSize !== categories.length) {
    alert(
      "The output shape of your model does not correspond to the number of categories!"
    );
    return;
  }

  const data = yield preprocess_predict(
    testImages,
    rescaleOptions,
    architectureOptions.inputShape
  );

  const { imageIds, categoryIds } = yield predictCategories(
    model,
    data,
    categories
  ); //returns an array of Image ID and an array of corresponding categories ID

  yield put(
    projectSlice.actions.updateImagesCategories({
      ids: imageIds,
      categoryIds: categoryIds,
    })
  );
}
