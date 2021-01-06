import React, { useState } from "react";
import * as ReactKonva from "react-konva";
import { Image as ImageType } from "../../../types/Image";
import { Stage } from "konva/types/Stage";
import { Circle } from "konva/types/shapes/Circle";
import { Transformer } from "konva/types/shapes/Transformer";
import { Group } from "konva/types/Group";
import * as _ from "underscore";
import { Line } from "konva/types/shapes/Line";
import { Image } from "konva/types/shapes/Image";
import Konva from "konva";
import useImage from "use-image";

export enum Method {
  Elliptical,
  Lasso,
  Magnetic,
  Polygonal,
  Quick,
  Rectangular,
}

type Anchor = {
  x: number;
  y: number;
};

type KonvaLassoSelectionCanvasProps = {
  image: ImageType;
};

type Stroke = {
  method: Method;
  points: Array<number>;
};

const sobel = (imageData: ImageData) => {
  const get = (data: any) => {
    return (x: number, y: number, index: number) => {
      index = index || 0;
      return data[(width * y + x) * 4 + index];
    };
  };

  const kernelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];
  const kernelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];
  const width = imageData.width;
  const height = imageData.height;

  const grayscale = [];
  const response = [];
  var data = imageData.data;
  const pixel = get(data);

  let x, y;
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      const r = pixel(x, y, 0);
      const g = pixel(x, y, 1);
      const b = pixel(x, y, 2);

      const mean = (r + g + b) / 3;

      grayscale.push(mean, mean, mean, 255);
    }
  }

  const grayscalePixel = get(grayscale);

  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      const responseX =
        kernelX[0][0] * grayscalePixel(x - 1, y - 1, 0) +
        kernelX[0][1] * grayscalePixel(x + 0, y - 1, 0) +
        kernelX[0][2] * grayscalePixel(x + 1, y - 1, 0) +
        kernelX[1][0] * grayscalePixel(x - 1, y + 0, 0) +
        kernelX[1][1] * grayscalePixel(x + 0, y + 0, 0) +
        kernelX[1][2] * grayscalePixel(x + 1, y + 0, 0) +
        kernelX[2][0] * grayscalePixel(x - 1, y + 1, 0) +
        kernelX[2][1] * grayscalePixel(x + 0, y + 1, 0) +
        kernelX[2][2] * grayscalePixel(x + 1, y + 1, 0);

      const responseY =
        kernelY[0][0] * grayscalePixel(x - 1, y - 1, 0) +
        kernelY[0][1] * grayscalePixel(x + 0, y - 1, 0) +
        kernelY[0][2] * grayscalePixel(x + 1, y - 1, 0) +
        kernelY[1][0] * grayscalePixel(x - 1, y + 0, 0) +
        kernelY[1][1] * grayscalePixel(x + 0, y + 0, 0) +
        kernelY[1][2] * grayscalePixel(x + 1, y + 0, 0) +
        kernelY[2][0] * grayscalePixel(x - 1, y + 1, 0) +
        kernelY[2][1] * grayscalePixel(x + 0, y + 1, 0) +
        kernelX[2][2] * grayscalePixel(x + 1, y + 1, 0);

      const magnitude =
        Math.sqrt(responseX * responseX + responseY * responseY) >>> 0;

      response.push(magnitude, magnitude, magnitude, 255);
    }
  }

  data = new Uint8ClampedArray(response);
};

const MarchingAnts = ({ stroke }: { stroke: Stroke }) => {
  // const [dashOffset, setDashOffset] = React.useState(0);
  //
  // React.useEffect(() => {
  //   setTimeout(() => {
  //     setDashOffset(dashOffset + 1);
  //
  //     if (dashOffset > 16) {
  //       setDashOffset(0);
  //     }
  //   }, 20);
  // }, [dashOffset]);

  return (
    <React.Fragment>
      <ReactKonva.Line points={stroke.points} stroke="#FFF" strokeWidth={1} />

      <ReactKonva.Line
        dash={[4, 2]}
        points={stroke.points}
        stroke="#000"
        strokeWidth={1}
      />
    </React.Fragment>
  );
};

export const MagneticSelection = ({
  image,
}: KonvaLassoSelectionCanvasProps) => {
  const [img] = useImage(image.src, "Anonymous");

  const stage = React.useRef<Stage>(null);
  const startingAnchorCircle = React.useRef<Circle>(null);
  const transformer = React.useRef<Transformer>(null);
  const group = React.useRef<Group>(null);
  const annotationRef = React.useRef<Line>(null);
  const imageRef = React.useRef<Image>(null);

  const [anchor, setAnchor] = useState<Anchor>();
  const [annotated, setAnnotated] = useState<boolean>(false);
  const [annotating, setAnnotating] = useState<boolean>(false);
  const [annotation, setAnnotation] = useState<Stroke>();
  const [start, setStart] = useState<Anchor>();
  const [strokes, setStrokes] = useState<Array<Stroke>>([]);

  const [earlyRelease, setEarlyRelease] = useState<boolean>(false);
  const [canClose, setCanClose] = useState<boolean>(false);

  React.useEffect(() => {
    if (imageRef && imageRef.current) {
      console.log("HERE WE ARE");
      imageRef.current.cache();

      imageRef.current.getLayer()?.batchDraw();
    }
  }, [img]);

  React.useEffect(() => {
    if (
      annotated &&
      annotationRef &&
      annotationRef.current &&
      transformer &&
      transformer.current
    ) {
      transformer.current.nodes([annotationRef.current]);

      transformer.current.getLayer()?.batchDraw();
    }
  }, [annotated]);

  const isInside = (
    startingAnchorCircle: React.RefObject<Circle>,
    position: { x: number; y: number }
  ) => {
    if (startingAnchorCircle && startingAnchorCircle.current) {
      const rectangle = startingAnchorCircle.current.getClientRect();
      return (
        rectangle.x <= position.x &&
        position.x <= rectangle.x + rectangle.width &&
        rectangle.y <= position.y &&
        position.y <= rectangle.y + rectangle.height
      );
    } else {
      return false;
    }
  };

  const connected = (position: { x: number; y: number }) => {
    const inside = isInside(startingAnchorCircle, position);
    if (strokes && strokes.length > 0) {
      return inside && canClose;
    }
  };

  const onMouseDown = () => {
    if (annotated) return;

    if (stage && stage.current) {
      const position = stage.current.getPointerPosition();

      if (position) {
        if (connected(position)) {
          const stroke: Stroke = {
            method: Method.Lasso,
            points: _.flatten(strokes.map((stroke: Stroke) => stroke.points)),
          };

          setAnnotated(true);
          setAnnotating(false);
          setAnnotation(stroke);
          setStrokes([]);
        } else {
          if (!earlyRelease) {
            if (anchor) {
              const stroke = {
                method: Method.Lasso,
                points: [anchor.x, anchor.y, position.x, position.y],
              };

              setStrokes([...strokes, stroke]);

              setAnchor(position);
            } else {
              setAnnotating(true);

              setStart(position);

              const stroke: Stroke = {
                method: Method.Lasso,
                points: [position.x, position.y],
              };

              setStrokes([...strokes, stroke]);
            }
          } else {
            setEarlyRelease(false);
          }
        }
      }
    }
  };

  const onMouseMove = () => {
    if (annotated) return;

    if (!annotating) return;

    if (stage && stage.current) {
      const position = stage.current.getPointerPosition();

      if (position) {
        if (!canClose && !isInside(startingAnchorCircle, position)) {
          setCanClose(true);
        }

        if (anchor && !earlyRelease) {
          const stroke = {
            method: Method.Lasso,
            points: [anchor.x, anchor.y, position.x, position.y],
          };

          if (strokes.length > 2) {
            strokes.splice(strokes.length - 1, 1, stroke);

            setStrokes(strokes.concat());
          } else {
            setStrokes([...strokes, stroke]);
          }
        } else {
          let stroke = strokes[strokes.length - 1];

          stroke.points = [...stroke.points, position.x, position.y];

          strokes.splice(strokes.length - 1, 1, stroke);

          setStrokes(strokes.concat());

          if (connected(position)) {
            //  TODO:
          } else {
            //  TODO:
          }
        }
      }
    }
  };

  const onMouseUp = () => {
    if (annotated) return;

    if (!annotating) return;

    if (stage && stage.current) {
      const position = stage.current.getPointerPosition();

      if (position) {
        if (connected(position)) {
          if (start) {
            const stroke = {
              method: Method.Lasso,
              points: [position.x, position.y, start.x, start.y],
            };

            setStrokes([...strokes, stroke]);
          }

          const stroke: Stroke = {
            method: Method.Lasso,
            points: _.flatten(strokes.map((stroke: Stroke) => stroke.points)),
          };

          setAnnotated(true);
          setAnnotating(false);
          setAnnotation(stroke);
          setStrokes([]);
        } else {
          if (!anchor && strokes[strokes.length - 1].points.length <= 2) {
            setEarlyRelease(true);
          }
          setAnchor(position);
        }
      }
    }
  };

  const Anchor = () => {
    if (annotating && anchor) {
      return (
        <ReactKonva.Circle
          fill="#FFF"
          name="anchor"
          radius={3}
          stroke="#FFF"
          strokeWidth={1}
          x={anchor.x}
          y={anchor.y}
        />
      );
    } else {
      return <React.Fragment />;
    }
  };

  const StartingAnchor = () => {
    if (annotating && start) {
      return (
        <ReactKonva.Circle
          fill="#000"
          globalCompositeOperation="source-over"
          hitStrokeWidth={64}
          id="start"
          name="anchor"
          radius={3}
          ref={startingAnchorCircle}
          stroke="#FFF"
          strokeWidth={1}
          x={start.x}
          y={start.y}
        />
      );
    } else {
      return <React.Fragment />;
    }
  };

  return (
    <ReactKonva.Stage
      globalCompositeOperation="destination-over"
      height={image.shape?.r}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      ref={stage}
      width={image.shape?.c}
    >
      <ReactKonva.Layer>
        <ReactKonva.Image
          filters={[sobel]}
          blurRadius={50}
          image={img}
          ref={imageRef}
        />

        <StartingAnchor />

        {!annotated &&
          annotating &&
          strokes.map((stroke: Stroke, key: number) => (
            <MarchingAnts key={key} stroke={stroke} />
          ))}

        <Anchor />

        {annotation && annotated && !annotating && (
          <MarchingAnts stroke={annotation} />
        )}

        <ReactKonva.Transformer
          anchorFill="#FFF"
          anchorStroke="#000"
          anchorStrokeWidth={1}
          anchorSize={6}
          borderEnabled={false}
          ref={transformer}
          rotateEnabled={false}
        />
      </ReactKonva.Layer>
    </ReactKonva.Stage>
  );
};
