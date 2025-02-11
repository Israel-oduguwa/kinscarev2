import React, { memo, useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import { EDITOR_JS_TOOLS } from "./Tools";

const BlogEditor = ({ data, onChange, editorBlock }:any) => {
    const editorRef = useRef<EditorJS | null>(null);
  //Initialize editorjs
  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: editorBlock,
        data: data,
        tools: EDITOR_JS_TOOLS,
        autofocus: true,
        onChange: async (api, event) => {
          try {
            const content = await api.saver.save();
            onChange(content);
          } catch (err) {
            console.error("Error saving content", err);
          }
        },
      });
      editorRef.current = editor;
    }

    // Cleanup Editor.js instance on unmount
    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === "function") {
        editorRef.current.destroy();
      }
    };
  }, []);
  return <div  className="prose max-w-6xl" id={editorBlock} />;
};

export default memo(BlogEditor);

