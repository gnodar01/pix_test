import { ShapeType } from "./ShapeType";
import { AnnotationType } from "./AnnotationType";

export type ImageViewerImage = {
  categoryId?: string;
  id: string;
  annotations: Array<AnnotationType>;
  name: string;
  shape: ShapeType;
  originalSrc: string; // original image data
  src: string; // filtered image data
};
