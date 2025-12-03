import Embed from "@editorjs/embed";
import ImageTool from '@editorjs/image';
import Table from "@editorjs/table";
import List from "@editorjs/list";
import Warning from "@editorjs/warning";
import Code from "@editorjs/code";
import LinkTool from "@editorjs/link";
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
import axios from 'axios';

// Your existing upload/delete functions
const uploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axios.post(
      ""https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/upload-file",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data.url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error('Image upload failed');
  }
};

const deleteFile = async (fileUrl: string) => {
  try {
    await axios.post(
      ""https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/delete-file",
      { fileUrl }
    );
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error('Image deletion failed');
  }
};

// EditorJS Configuration
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
      endpoint: "https://api.linkpreview.net",
    },
  },
  image: {
    class: ImageTool,
    config: {
      uploader: {
        uploadByFile: async (file: File) => {
          const url = await uploadFile(file);
          return {
            success: 1,
            file: {
              url: url,
            }
          };
        },
        uploadByUrl: async (url: string) => {
          // If you want to handle URL uploads
          return {
            success: 1,
            file: { url }
          };
        }
      },
      onDelete: async (fileUrl: string) => {
        await deleteFile(fileUrl);
        return { success: 1 };
      },
      additionalRequestHeaders: {
        'X-Custom-Header': 'Custom Value' // Add if needed
      },
      // Validation based on your requirements
      validate: (file: File) => {
        const baseUrl = "fileupload-kinscare.s3.amazonaws.com";
        const allowedExtensions = /(jpeg|jpg|png|svg|pdf|octet-stream)$/i;
        
        if (!allowedExtensions.exec(file.name)) {
          return 'Invalid file type';
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          return 'File too large';
        }
        
        return true;
      }
    }
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
      editorJSConfig: {
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
      },
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
          style: "background-color: #f7f9fc; border-radius: 6px; width: 100%; margin: 40px 0;",
          children: [
            {
              type: "item",
              id: "",
              className: "",
              style: "",
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