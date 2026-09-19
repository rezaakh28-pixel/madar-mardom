"use client";

import * as React from "react";
import { FitText } from "@/components/shared/fit-text";

/**
 * A title + lead pair where the lead's font size is always derived from the
 * title's own resolved size (title size − `leadOffset`, never below
 * `leadMinFontSize`) — so the lead stays a step smaller than the title no
 * matter how much the title itself had to shrink to fit. Both are FitText,
 * so both individually shrink-to-fit within their own line count too.
 */
export function TitleLeadFit({
  title,
  lead,
  titleAs = "h3",
  titleMaxLines,
  titleMaxFontSize,
  titleMinFontSize,
  titleClassName,
  leadMaxLines = 1,
  leadOffset = 3,
  leadMinFontSize = 9,
  leadClassName,
}: {
  title: string;
  /** Omit to render the title only, with no lead (e.g. no lead text available). */
  lead?: string;
  titleAs?: React.ElementType;
  titleMaxLines: number;
  titleMaxFontSize: number;
  titleMinFontSize: number;
  titleClassName?: string;
  leadMaxLines?: number;
  leadOffset?: number;
  leadMinFontSize?: number;
  leadClassName?: string;
}) {
  const [titleSize, setTitleSize] = React.useState(titleMaxFontSize);
  const leadMaxFontSize = Math.max(titleSize - leadOffset, leadMinFontSize);

  return (
    <>
      <FitText
        as={titleAs}
        maxLines={titleMaxLines}
        maxFontSize={titleMaxFontSize}
        minFontSize={titleMinFontSize}
        className={titleClassName}
        onFontSizeChange={setTitleSize}
      >
        {title}
      </FitText>
      {lead && (
        <FitText
          as="p"
          maxLines={leadMaxLines}
          maxFontSize={leadMaxFontSize}
          minFontSize={leadMinFontSize}
          className={leadClassName}
        >
          {lead}
        </FitText>
      )}
    </>
  );
}
