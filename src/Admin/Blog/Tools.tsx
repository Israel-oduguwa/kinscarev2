// import Embed from "@editorjs/embed";
// import Table from "@editorjs/table";
// import List from "@editorjs/list";
// import Warning from "@editorjs/warning";
// import Code from "@editorjs/code";
// import LinkTool from "@editorjs/link";
// // import Image from "@editorjs/simple-image";
// import SimpleImage from "@editorjs/simple-image";
// import Raw from "@editorjs/raw";
// import Paragraph from "@editorjs/paragraph";
// // import Header from "@editorjs/header";
// import Header from "editorjs-header-with-anchor";
// import Quote from "@editorjs/quote";
// import Marker from "@editorjs/marker";
// import CheckList from "@editorjs/checklist";
// import Delimiter from "@editorjs/delimiter";
// import InlineCode from "@editorjs/inline-code";
// // import SimpleImage from "simple-image-editorjs";
// import { LayoutBlockTool, LayoutBlockContainerData } from "editorjs-layout";
// import { StyleInlineTool } from "editorjs-style";
// import EditorJS from "@editorjs/editorjs";

// const editorJSConfig = {
//   autofocus: true,
//   tools: {
//     header: {
//       class: Header,
//       shortcut: "CMD+SHIFT+H",
//     },
//     list: List,
//     marker: Marker,
//     checklist: CheckList,
//   },
// };

// export const EDITOR_JS_TOOLS = {
//   header: {
//     class: Header,
//     shortcut: "CMD+SHIFT+H",
//   },
//   paragraph: {
//     class: Paragraph,
//     inlineToolbar: true,
//   },
//   layout: {
//     class: LayoutBlockTool,
//     config: {
//       EditorJS,
//       editorJSConfig,
//       enableLayoutEditing: false,
//       enableLayoutSaving: true,
//       initialData: {
//         itemContent: {
//           1: {
//             blocks: [],
//           },
//         },
//         layout: {
//           type: "container",
//           id: "Example",
//           className: "",
//           style:
//             "background-color: #f7f9fc; border-radius: 6px; width: 100%; margin: 40px 0;",
//           children: [
//             {
//               type: "item",
//               id: "",
//               className: "",
//               style: "", // No additional style applied to the item
//               itemContentId: "1",
//             },
//           ],
//         },
//       },
//     },
//   },
//   embed: Embed,
//   // table: Table,
//   marker: Marker,
//   list: {
//     class: List,
//     inlineToolbar: true,
//   },
//   // warning: Warning,
//   // code: Code,
//   // linkTool: LinkTool,
//   image: SimpleImage,
//   // raw: Raw,
//   // quote: Quote,
//   checklist: CheckList,
//   // delimiter: Delimiter,
//   inlineCode: InlineCode,
//   style: StyleInlineTool,
// };

// Tools.ts
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import List from "@editorjs/list";
import Warning from "@editorjs/warning";
import Code from "@editorjs/code";
import LinkTool from "@editorjs/link";
import SimpleImage from "@editorjs/simple-image";
import Raw from "@editorjs/raw";
import Paragraph from "@editorjs/paragraph";
import Header from "editorjs-header-with-anchor";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import CheckList from "@editorjs/checklist";
import Delimiter from "@editorjs/delimiter";
import InlineCode from "@editorjs/inline-code";
import { LayoutBlockTool } from "editorjs-layout";
import { StyleInlineTool } from "editorjs-style";
import EditorJS from "@editorjs/editorjs";

const editorJSConfig = {
    autofocus: true,
    tools: {
      header: {
        class: Header,
        shortcut: "CMD+SHIFT+H",
      },
      list: List,
      marker: Marker,
      checklist: CheckList,
    },
  };

export const EDITOR_JS_TOOLS = {
  header: {
    class: Header,
    inlineToolbar: true,
    shortcut: "CMD+SHIFT+H",
  },
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
  },
  list: {
    class: List,
    inlineToolbar: true,
  },
  embed: {
    class: Embed,
    inlineToolbar: false,
    config: {
      services: {
        youtube: true,
        coub: true,
        // You can add other services if needed
      },
    },
  },
  table: {
    class: Table,
    inlineToolbar: true,
    config: {
      rows: 2,
      cols: 3,
    },
  },
  warning: Warning,
  code: {
    class: Code,
    inlineToolbar: true,
  },
  linkTool: {
    class: LinkTool,
    config: {
      endpoint: "https://api.linkpreview.net", // Replace with your own endpoint if needed
    },
  },
  image: {
    class: SimpleImage,
    inlineToolbar: true,
  },
  raw: Raw,
  quote: {
    class: Quote,
    inlineToolbar: true,
    config: {
      quotePlaceholder: "Enter a quote",
      captionPlaceholder: "Quote's author",
    },
  },
  marker: {
    class: Marker,
  },
  checklist: CheckList,
  delimiter: Delimiter,
  inlineCode: InlineCode,
  layout: {
    class: LayoutBlockTool,
    config: {
      EditorJS,
      editorJSConfig,
      enableLayoutEditing: false,
      enableLayoutSaving: true,
      initialData: {
        itemContent: {
          1: {
            blocks: [],
          },
        },
        layout: {
          type: "container",
          id: "Example",
          className: "",
          style:
            "background-color: #f7f9fc; border-radius: 6px; width: 100%; margin: 40px 0;",
          children: [
            {
              type: "item",
              id: "",
              className: "",
              style: "", // No additional style applied to the item
              itemContentId: "1",
            },
          ],
        },
      },
    },
  },
  style: {
    class: StyleInlineTool,
  },
};
