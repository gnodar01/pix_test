import React, { useEffect, useRef, useState } from "react";
import { useStyles } from "./LassoSelectionCanvas.css";
import { Pen } from "../../image/Pen/Pen";
import { midpoint, Point } from "../../image/Pen/Point";
import { CatenaryCurve } from "../../image/Pen/CatenaryCurve";
import { Image as ImageType } from "../../types/Image";
import * as Konva from "react-konva";
import * as _ from "underscore";
import { SelectCategoryDialog } from "../SelectCategoryDialog";
import { MenuItem } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";

type Stroke = {
  color: string;
  radius: number;
  points: Array<{ x: number; y: number }>;
  category: string;
};

const clear = (context: CanvasRenderingContext2D | null) => {
  if (context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }
};

const drawImage = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number = 0,
  y: number = 0,
  w?: number,
  h?: number,
  offsetX: number = 0.5,
  offsetY: number = 0.5
) => {
  if (!w) w = context.canvas.width;
  if (!h) h = context.canvas.height;

  // keep bounds [0.0, 1.0]
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;

  let imageWidth = image.width;
  let imageHeight = image.height;
  let r = Math.min(w / imageWidth, h / imageHeight);
  let updatedWidth = imageWidth * r; // new prop. width
  let updatedHeight = imageHeight * r; // new prop. height
  let cx;
  let cy;
  let cw;
  let ch;
  let ar = 1;

  // decide which gap to fill
  if (updatedWidth < w) ar = w / updatedWidth;
  if (Math.abs(ar - 1) < 1e-14 && updatedHeight < h) ar = h / updatedHeight; // updated

  updatedWidth *= ar;
  updatedHeight *= ar;

  // calc source rectangle
  cw = imageWidth / (updatedWidth / w);
  ch = imageHeight / (updatedHeight / h);

  cx = (imageWidth - cw) * offsetX;
  cy = (imageHeight - ch) * offsetY;

  // make sure source rectangle is valid
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > imageWidth) cw = imageWidth;
  if (ch > imageHeight) ch = imageHeight;

  // fill image in dest. rectangle
  context.drawImage(image, cx, cy, cw, ch, x, y, w, h);
};

const drawStartingPoint = (
  context: CanvasRenderingContext2D,
  point: { x: number; y: number }
) => {
  context.beginPath();
  context.setLineDash([]);
  context.arc(point.x, point.y, 2, 0, 2 * Math.PI);
  context.fill();
  context.strokeStyle = "#FFF";
  context.lineWidth = 1;
  context.arc(point.x, point.y, 3, 0, 2 * Math.PI);
  context.stroke();
};

type PenCanvasProps = {
  lazyRadius: number;
  tipColor: string;
  tipRadius: number;
  image: ImageType;
};

export const LassoSelectionCanvas = ({
  lazyRadius,
  tipColor,
  tipRadius,
  image,
}: PenCanvasProps) => {
  const interfaceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const temporaryCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const requestRef = React.useRef<number>();

  const [
    interfaceCanvasContext,
    setInterfaceCanvasContext,
  ] = useState<CanvasRenderingContext2D | null>(null);

  const [
    selectionCanvasContext,
    setSelectionCanvasContext,
  ] = useState<CanvasRenderingContext2D | null>(null);

  const [
    temporaryCanvasContext,
    setTemporaryCanvasContext,
  ] = useState<CanvasRenderingContext2D | null>(null);

  const [
    imageCanvasContext,
    setImageCanvasContext,
  ] = useState<CanvasRenderingContext2D | null>(null);

  const curve = useRef<CatenaryCurve>(new CatenaryCurve());

  const [offset, setOffset] = useState<number>(0);

  const chainLength = lazyRadius * window.devicePixelRatio;

  const pen = useRef<Pen>(
    new Pen(
      true,
      new Point({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }),
      lazyRadius * window.devicePixelRatio
    )
  );

  const [strokes, setStrokes] = useState<Array<Stroke>>([]);
  const [moved, setMoved] = useState<boolean>(false);
  const [pressed, setPressed] = useState<boolean>(false);
  const [selecting, setSelecting] = useState<boolean>(false);
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [updated, setUpdated] = useState<boolean>(true);

  const [open, setOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState("category 1");
  const [anchorEl, setAnchorEl] = React.useState<null | Element>(null);

  const classes = useStyles();

  const handleClose = (category: string) => {
    setOpen(false);
    setSelectedCategory(category);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const drawPoints = (
    context: CanvasRenderingContext2D,
    points: Array<{ x: number; y: number }>,
    dash: [number, number],
    color: string = "#f2530b",
    radius: number = 1,
    offset: number = 5
  ) => {
    if (points.length < 2) return;

    if (context) {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);

      let p1 = points[0];
      let p2 = points[1];

      drawStartingPoint(context, p1);

      context.moveTo(p2.x, p2.y);

      context.beginPath();
      context.globalCompositeOperation = "destination-over";
      context.lineJoin = "round";
      context.lineCap = "round";
      context.strokeStyle = color;

      context.lineWidth = radius;
      context.setLineDash(dash);
      context.lineDashOffset = offset;

      for (let i = 1, len = points.length; i < len; i++) {
        // we pick the point between pi+1 & pi+2 as the
        // end point and p1 as our control point
        const m = midpoint(new Point(p1), new Point(p2));

        context.quadraticCurveTo(p1.x, p1.y, m.x, m.y);

        p1 = points[i];
        p2 = points[i + 1];
      }

      // Draw last line as a straight line while
      // we wait for the next point to be able to calculate
      // the bezier control point
      context.lineTo(p1.x, p1.y);
      context.stroke();
    }
  };

  const getPosition = (
    event: React.MouseEvent | React.TouchEvent
  ): { x: number; y: number } => {
    const boundingClientRect = interfaceCanvasRef.current?.getBoundingClientRect();

    let x: number = (event as React.MouseEvent).clientX;
    let y: number = (event as React.MouseEvent).clientY;

    if (event instanceof TouchEvent) {
      x = event.changedTouches[0].clientX;
      y = event.changedTouches[0].clientY;
    }

    return {
      x: x - boundingClientRect!.left,
      y: y - boundingClientRect!.top,
    };
  };

  const move = (x: number, y: number) => {
    pen.current.update(new Point({ x: x, y: y }));

    if ((pressed && !selecting) || (!pen.current.enabled && pressed)) {
      setSelecting(true);

      setPoints([...points, { x: pen.current.tip.x, y: pen.current.tip.y }]);
    }

    if (selecting) {
      setPoints([...points, { x: pen.current.tip.x, y: pen.current.tip.y }]);

      drawPoints(temporaryCanvasContext!, points, [5, 5], "#FFF", 1, offset);
    }

    setMoved(true);
  };

  const onEnd = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();

    console.log(event.currentTarget);

    onMove(event);

    setSelecting(false);

    setPressed(false);

    //two cases:
    //CASE 1: mouse is up, but we are not over the control point
    //change to line tool

    //CASE 2: if we are on control point, "finish selection" should should up
    let p1 = points[0];
    //Do we allow for pixels around for the control point, for better UI?
    let possible_x = [];
    let possible_y = [];
    let buffer = 2;
    for (var i = -buffer; i <= buffer; i++) {
      possible_x.push(p1.x + i);
      possible_y.push(p1.y + i);
    }
    if (
      possible_x.includes(points[points.length - 1].x) &&
      possible_y.includes(points[points.length - 1].y)
    ) {
      console.log("here I am above the control point");
      setAnchorEl(event.currentTarget);
    }

    saveStroke(tipColor, tipRadius);
  };

  const onLeave = (event: React.MouseEvent) => {
    clear(interfaceCanvasContext);
  };

  const onMove = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();

    const { x, y } = getPosition(event);

    move(x, y);
  };

  const onStart = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();

    setPressed(true);

    const { x, y } = getPosition(event);

    if (event instanceof TouchEvent) {
      const point = new Point({ x: x, y: y });

      pen.current.update(point, true);
    }

    move(x, y);
  };

  const saveStroke = (color: string, radius: number) => {
    if (points.length < 2) return;

    setOpen(true);

    const stroke: Stroke = {
      color: color,
      points: [...points],
      radius: radius,
      category: selectedCategory,
    };

    setStrokes([...strokes, stroke]);

    setPoints([]);

    if (temporaryCanvasRef && temporaryCanvasRef.current) {
      // Copy the stroke to the selection canvas
      if (selectionCanvasContext) {
        selectionCanvasContext.drawImage(
          temporaryCanvasRef.current,
          0,
          0,
          temporaryCanvasRef.current.width,
          temporaryCanvasRef.current.height
        );
      }

      // Clear the temporary canvas
      if (temporaryCanvasContext) {
        clear(temporaryCanvasContext);
      }
    }
  };

  useEffect(() => {
    const animate = () => {
      if (moved || updated) {
        if (interfaceCanvasContext) {
          interfaceCanvasContext.clearRect(
            0,
            0,
            interfaceCanvasContext.canvas.width,
            interfaceCanvasContext.canvas.height
          );
        }

        setMoved(false);
        setUpdated(false);
      }

      pen.current.update(
        new Point({
          x: window.innerWidth / 2 - chainLength / 4,
          y: window.innerHeight / 2,
        }),
        true
      );

      pen.current.update(
        new Point({
          x: window.innerWidth / 2 + chainLength / 4,
          y: window.innerHeight / 2,
        }),
        false
      );

      // setMoved(true);
      // setUpdated(true);

      // setStrokes([]);
      // setUpdated(true);

      // clear([selectionCanvasContext, temporaryCanvasContext]);
      // clear(temporaryCanvasContext)
      // clear([temporaryCanvasContext]);

      // if (this.props.saveData) {
      //   this.loadSaveData(this.props.saveData);
      // }

      setOffset(offset + 1);

      if (offset > 16) {
        setOffset(0);
      }
    };

    if (interfaceCanvasRef && interfaceCanvasRef.current) {
      setInterfaceCanvasContext(interfaceCanvasRef.current?.getContext("2d"));
    }

    if (selectionCanvasRef && selectionCanvasRef.current) {
      setSelectionCanvasContext(selectionCanvasRef.current?.getContext("2d"));
    }

    if (temporaryCanvasRef && temporaryCanvasRef.current) {
      setTemporaryCanvasContext(temporaryCanvasRef.current?.getContext("2d"));
    }

    if (imageCanvasRef && imageCanvasRef.current) {
      setImageCanvasContext(imageCanvasRef.current?.getContext("2d"));
    }

    const img = new Image();

    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (imageCanvasContext) {
        drawImage(imageCanvasContext, img);
      }
    };

    img.src = image.src;

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(requestRef.current as number);
    };
  }, [
    chainLength,
    curve,
    imageCanvasContext,
    interfaceCanvasContext,
    moved,
    pen,
    selectionCanvasContext,
    image,
    temporaryCanvasContext,
    updated,
    offset,
  ]);

  return (
    <React.Fragment>
      <div className={classes.container}>
        <canvas
          className={classes.interface}
          height={image.shape?.r}
          onMouseDown={onStart}
          onMouseLeave={onLeave}
          onMouseMove={onMove}
          onMouseUp={onEnd}
          onTouchCancel={onEnd}
          onTouchEnd={onEnd}
          onTouchMove={onMove}
          onTouchStart={onStart}
          ref={interfaceCanvasRef}
          width={image.shape?.c}
        />

        <canvas
          className={classes.selection}
          height={image.shape?.r}
          ref={selectionCanvasRef}
          width={image.shape?.c}
        />

        <canvas
          className={classes.temporary}
          height={image.shape?.r}
          ref={temporaryCanvasRef}
          width={image.shape?.c}
        />

        <canvas
          className={classes.image}
          height={image.shape?.r}
          ref={imageCanvasRef}
          width={image.shape?.c}
        />
      </div>

      {/*<SelectCategoryDialog*/}
      {/*  selectedCategory={selectedCategory}*/}
      {/*  open={open}*/}
      {/*  onClose={handleClose}*/}
      {/*/>*/}
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleCloseMenu}>Profile</MenuItem>
        <MenuItem onClick={handleCloseMenu}>My account</MenuItem>
        <MenuItem onClick={handleCloseMenu}>Logout</MenuItem>
      </Menu>

      <Konva.Stage height={image.shape?.c} width={image.shape?.c}>
        <Konva.Layer>
          {strokes.map((stroke: Stroke) => {
            const points: Array<number> = _.flatten(
              stroke.points.map(({ x, y }) => [x, y])
            );

            return <Konva.Line points={points} />;
          })}
        </Konva.Layer>
      </Konva.Stage>
    </React.Fragment>
  );
};
