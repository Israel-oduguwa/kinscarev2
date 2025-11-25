// editorJsToHtml.tsx
import React from "react";
import ReactDOMServer from "react-dom/server";
import Blocks from "editorjs-blocks-react-renderer";

// Define types for the Table of Contents (TOC) and conversion result.
export interface TocItem {
  level: number;
  text: string;
  id: string;
}

export interface ConvertedContent {
  html: string;
  toc: TocItem[];
}

/* -------------------------------
   Custom Renderers
---------------------------------*/

// Header parser: Always renders the header element.
// If data.anchor exists, it's applied as the id.
const HeaderIDParser = ({ data }: { data: any }) => {
  const Tag:any = `h${data.level}`;
  // Generate id from data.anchor if available.
  const id = data.anchor ? data.anchor : undefined;
  return (
    <Tag id={id} className="mt-4 font-bold">
      {data.text}
    </Tag>
  );
};

const ImageBlockParser = ({ data }: { data: any }) => {
  // Check for the new image data structure
  if (!data?.file?.url) return null;

  // Extract values with defaults
  const url = data.file.url;
  const caption = data.caption || "";
  const withBorder = data.withBorder || false;
  const withBackground = data.withBackground || false;
  const stretched = data.stretched || false;

  // Determine styling classes
  const borderClass = withBorder ? "border-2 border-gray-300" : "";
  const backgroundClass = withBackground ? "bg-gray-100 p-4 rounded-lg" : "";
  const stretchClass = stretched ? "max-w-none w-full" : "mx-auto";

  return (
    <figure className={`my-6 ${backgroundClass}`}>
      <img
        src={url}
        alt={caption}
        className={`rounded-lg ${borderClass} ${stretchClass}`}
        style={{
          maxWidth: stretched ? "100%" : "800px",
          height: "auto",
          display: "block"
        }}
      />
      {caption && (
        <figcaption className="text-center text-sm text-gray-600 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

// Custom layout parser – ensure the inner content is available before mapping.
const CustomLayoutParser = ({ data }: { data: any }) => {
  if (
    data &&
    data.itemContent &&
    data.itemContent["1"] &&
    Array.isArray(data.itemContent["1"].blocks)
  ) {
    const innerBlocks = data.itemContent["1"].blocks.map((innerBlock: any, index: number) => {
      switch (innerBlock.type) {
        case "header": {
          const HeaderTag:any = `h${innerBlock.data.level}`;
          const id = innerBlock.data.anchor ? innerBlock.data.anchor : undefined;
          return (
            <HeaderTag key={index} id={id} className="mt-4 font-bold">
              {innerBlock.data.text}
            </HeaderTag>
          );
        }
        case "paragraph": {
          return <p key={index} className="mt-2">{innerBlock.data.text}</p>;
        }
        case "image": {
          const border = innerBlock.data.withBorder ? "border border-gray-300" : "";
          return (
            <figure key={index} className="mb-5">
              <img
                src={innerBlock.data.url}
                alt={innerBlock.data.caption || "Image"}
                className={`w-full rounded ${border}`}
              />
              {innerBlock.data.caption && (
                <figcaption className="text-center text-sm text-gray-500 mt-2">
                  {innerBlock.data.caption}
                </figcaption>
              )}
            </figure>
          );
        }
        default:
          return null;
      }
    });
    return <div className="bg-gray-50 rounded p-6 my-10">{innerBlocks}</div>;
  }
  return null;
};

/* -------------------------------
   Conversion Function
---------------------------------*/

/**
 * Converts Editor.js JSON data to an HTML string and extracts a Table of Contents.
 * @param editorData The Editor.js JSON data.
 * @returns An object containing the HTML string and a TOC array.
 */
export function convertEditorJsToHtml(editorData: any): ConvertedContent {
  if (!editorData || !Array.isArray(editorData.blocks)) {
    return { html: "", toc: [] };
  }

  let html = "";
  let toc: TocItem[] = [];

  try {
    // Render the Editor.js content to a static HTML string using the Blocks component.
    html = ReactDOMServer.renderToStaticMarkup(
      <Blocks
      key={JSON.stringify(editorData)}
      data={editorData}
      renderers={{
        header: HeaderIDParser,
        layout: CustomLayoutParser,
        image: ImageBlockParser,
      }}
      config={{
        image: {
          // Additional config for image class names
          className: "editorjs-image"
        }
      }}
    />
    );
  } catch (renderError) {
    console.error("Error rendering HTML from Editor.js content:", renderError);
    html = "";
  }

  try {
    // Use a map to track occurrence counts for each generated id.
    const idMap: { [id: string]: number } = {};

    // Build the Table of Contents (TOC) from header blocks.
    toc = editorData.blocks.reduce((acc: TocItem[], block: any) => {
      if (block.type === "header") {
        const level: number = Number(block.data.level) || 1;
        const text: string = typeof block.data.text === "string" ? block.data.text : "";
        // Generate an id from anchor if available or from text.
        let id: string =
          block.data.anchor ||
          text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
        // Ensure uniqueness by appending a suffix if necessary.
        if (idMap[id]) {
          idMap[id] += 1;
          id = `${id}-${idMap[id]}`;
        } else {
          idMap[id] = 1;
        }
        acc.push({ level, text, id });
      }
      return acc;
    }, []);
  } catch (tocError) {
    console.error("Error building TOC from Editor.js content:", tocError);
    toc = [];
  }

  return { html, toc };
}
