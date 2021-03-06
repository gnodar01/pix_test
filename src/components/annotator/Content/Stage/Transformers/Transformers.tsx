import React from "react";
import { useSelector } from "react-redux";
import { AnnotationTool } from "../../../../../annotator/image/Tool";
import { selectedAnnotationsIdsSelector } from "../../../../../store/selectors/selectedAnnotationsIdsSelector";

import { Transformer } from "../Transformer/Transformer";

type TransformersProps = {
  transformPosition: ({
    x,
    y,
  }: {
    x: number;
    y: number;
  }) => { x: number; y: number } | undefined;
  annotationTool?: AnnotationTool;
};

export const Transformers = ({
  transformPosition,
  annotationTool,
}: TransformersProps) => {
  const selectedAnnotationsIds = useSelector(selectedAnnotationsIdsSelector);

  if (!selectedAnnotationsIds) return <></>;

  return (
    <>
      {selectedAnnotationsIds.map((annotationId, idx) => {
        return (
          <>
            <React.Fragment key={annotationId}>
              <Transformer
                transformPosition={transformPosition}
                annotationId={annotationId}
                annotationTool={annotationTool}
              />
            </React.Fragment>
          </>
        );
      })}
    </>
  );
};
