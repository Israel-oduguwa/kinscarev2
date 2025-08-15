import { Separator } from "@/components/ui/separator";
import BulletList from "@tiptap/extension-bullet-list";
import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import OrderedList from "@tiptap/extension-ordered-list";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Dropcursor from "@tiptap/extension-dropcursor";
import {
  type Editor,
  EditorContent,
  FloatingMenu,
  useEditor,
  BubbleMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading3,
  Italic,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  RedoIcon,
  Strikethrough,
  UnderlineIcon,
  UndoIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "@tiptap/extension-image";
import { Button } from "./ui/button";
import { Toggle } from "./ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import axios from "axios";

type Props = {
  editor: Editor | null;
};

const WordCountAndRanking = ({ editor }: Props) => {
  if (!editor) {
    return null;
  }
  // this ranks the content if it is good or not
  const limit = 100000;
  const percentage = (editor.storage.characterCount.characters() / limit) * 100;
  const buttonClass = `
  p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center
  active:bg-gray-300 dark:active:bg-gray-600
`;
  return (
    <div
      className={`flex items-center gap-1 character-count ${
        editor.storage.characterCount.characters() === limit
          ? "character-count--warning"
          : ""
      }`}
    >
      <svg height="16" width="16" viewBox="0 0 20 20">
        <circle r="10" cx="10" cy="10" fill="#e9ecef" />
        <circle
          r="5"
          cx="10"
          cy="10"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={`calc(${percentage} * 31.4 / 100) 31.4`}
          transform="rotate(-90) translate(-20)"
        />
        <circle r="6" cx="10" cy="10" fill="white" />
      </svg>
      <p className="text-sm text-gray-600 font-normal">
        {" "}
        {editor.storage.characterCount.words()} words
      </p>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className={buttonClass}
            >
              <RedoIcon
                size={16}
                strokeWidth={2.5}
                className=" text-gray-800 font-bold dark:text-gray-200"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className={buttonClass}
            >
              <UndoIcon
                size={16}
                strokeWidth={2.5}
                className=" text-gray-800 font-bold dark:text-gray-200"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const ToolBar = ({ editor }: Props) => {
  if (!editor) {
    return null;
  }

  const buttonClass = `
    p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center
    active:bg-gray-300 dark:active:bg-gray-600
  `;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <>
      <TooltipProvider>
        <div className="flex h-11 items-center space-x-2 p-0 px-3 border-b bg-white dark:bg-gray-800 shadow-md rounded-lg md:flex-row md:relative md:w-full">
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                pressed={editor.isActive("heading", { level: 1 })}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={buttonClass}
              >
               <Heading1 strokeWidth={2.5} size={20} />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Heading 1</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                pressed={editor.isActive("heading", { level: 3 })}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={buttonClass}
              >
                <Heading3 size={20} strokeWidth={2.5} />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Heading 3</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Toggle
                pressed={editor.isActive("bold")}
                onPressedChange={() =>
                  editor.chain().focus().toggleBold().run()
                }
                aria-label="Toggle bold"
                className={buttonClass}
              >
                <Bold
                  size={16}
                  strokeWidth={4}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bold</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                pressed={editor.isActive("italic")}
                onPressedChange={() =>
                  editor.chain().focus().toggleItalic().run()
                }
                className={buttonClass}
              >
                <Italic
                  size={15}
                  strokeWidth={2.5}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Italic</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                pressed={editor.isActive("underline")}
                onPressedChange={() =>
                  editor.chain().focus().toggleUnderline().run()
                }
                className={buttonClass}
              >
                <UnderlineIcon
                  size={15}
                  strokeWidth={2.5}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Underline</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                pressed={editor.isActive("strike")}
                onPressedChange={() =>
                  editor.chain().focus().toggleStrike().run()
                }
                className={buttonClass}
              >
                <Strikethrough
                  size={15}
                  strokeWidth={2.5}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Strikethrough</p>
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" />
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                onPressedChange={() => editor.chain().toggleBulletList().run()}
                pressed={editor.isActive("bulletList")}
                className={buttonClass}
              >
                <ListIcon
                  size={15}
                  strokeWidth={2}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                onPressedChange={() =>
                  editor.chain().focus().toggleOrderedList().run()
                }
                pressed={editor.isActive("orderedList")}
                className={buttonClass}
              >
                <ListOrderedIcon
                  size={15}
                  strokeWidth={2}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" />
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                onPressedChange={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                pressed={editor.isActive({ textAlign: "left" })}
                className={buttonClass}
              >
                <AlignLeft
                  size={15}
                  strokeWidth={2}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Left</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                onPressedChange={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                pressed={editor.isActive({ textAlign: "center" })}
                className={buttonClass}
              >
                <AlignCenter
                  size={15}
                  strokeWidth={2}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Center</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                onPressedChange={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                pressed={editor.isActive({ textAlign: "right" })}
                className={buttonClass}
              >
                <AlignRight
                  size={15}
                  strokeWidth={2}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Right</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" />
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                onClick={setLink}
                pressed={editor.isActive("link")}
                className={buttonClass}
              >
                <LinkIcon
                  size={15}
                  strokeWidth={2.5}
                  className=" text-gray-800 font-bold dark:text-gray-200 mr-1"
                />
                <p>link</p>
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Link</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </>
  );
};
const PostsToolBar = ({ editor }: Props) => {
  if (!editor) {
    return null;
  }

  const buttonClass = `
    p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center
    active:bg-gray-300 dark:active:bg-gray-600
  `;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <>
      <TooltipProvider>
        <div className="flex h-10 items-center space-x-0 p-0 px-2 border-b bg-white dark:bg-gray-800 shadow-md rounded-lg md:flex-row md:relative md:w-full">
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                pressed={editor.isActive("heading", { level: 1 })}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={buttonClass}
              >
                <h1 className="text-md font-bold">H1</h1>
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Heading 1</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                pressed={editor.isActive("heading", { level: 3 })}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={buttonClass}
              >
                <h1 className="text-md font-bold">H3</h1>
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Heading 3</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                pressed={editor.isActive("bold")}
                onPressedChange={() =>
                  editor.chain().focus().toggleBold().run()
                }
                aria-label="Toggle bold"
                className={buttonClass}
              >
                <Bold
                  size={14}
                  strokeWidth={4}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bold</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                pressed={editor.isActive("italic")}
                onPressedChange={() =>
                  editor.chain().focus().toggleItalic().run()
                }
                className={buttonClass}
              >
                <Italic
                  size={14}
                  strokeWidth={2.5}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Italic</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                pressed={editor.isActive("underline")}
                onPressedChange={() =>
                  editor.chain().focus().toggleUnderline().run()
                }
                className={buttonClass}
              >
                <UnderlineIcon
                  size={15}
                  strokeWidth={2.5}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Underline</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                pressed={editor.isActive("strike")}
                onPressedChange={() =>
                  editor.chain().focus().toggleStrike().run()
                }
                className={buttonClass}
              >
                <Strikethrough
                  size={15}
                  strokeWidth={2.5}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Strikethrough</p>
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" />
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                onPressedChange={() => editor.chain().toggleBulletList().run()}
                pressed={editor.isActive("bulletList")}
                className={buttonClass}
              >
                <ListIcon
                  size={15}
                  strokeWidth={2}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                onPressedChange={() =>
                  editor.chain().focus().toggleOrderedList().run()
                }
                pressed={editor.isActive("orderedList")}
                className={buttonClass}
              >
                <ListOrderedIcon
                  size={15}
                  strokeWidth={2}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" />
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                onPressedChange={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                pressed={editor.isActive({ textAlign: "left" })}
                className={buttonClass}
              >
                <AlignLeft
                  size={15}
                  strokeWidth={2}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Left</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                onPressedChange={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                pressed={editor.isActive({ textAlign: "center" })}
                className={buttonClass}
              >
                <AlignCenter
                  size={15}
                  strokeWidth={2}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Center</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                onPressedChange={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                pressed={editor.isActive({ textAlign: "right" })}
                className={buttonClass}
              >
                <AlignRight
                  size={15}
                  strokeWidth={2}
                  className=" text-gray-800 font-bold dark:text-gray-200"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Right</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" />
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                onClick={setLink}
                pressed={editor.isActive("link")}
                className={buttonClass}
              >
                <LinkIcon
                  size={15}
                  strokeWidth={2.5}
                  className=" text-gray-800 font-bold dark:text-gray-200 mr-1"
                />
                <p>link</p>
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Link</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </>
  );
};

function TextEditor({
  onChange,
  initialContent,
  usage,
}: {
  onChange: Function;
  initialContent: string;
  usage: string;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previousContent, setPreviousContent] = useState<string[]>([]);
  const bufferRef = useRef<string>("");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const editor: any = useEditor({
    immediatelyRender:false,
    extensions: [
      StarterKit.configure(),
      Image.configure({
        inline: true,
      }),
      Dropcursor.configure({ color: "blue", width: 2 }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      CharacterCount.configure({ limit: 100000 }),
      BulletList,
      OrderedList,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: " p-3 mx-auto focus:outline-none",
      },

      handlePaste(view, event) {
        const items: any = event.clipboardData?.items;
        if (items) {
          for (const item of items) {
            if (item.type.startsWith("image/")) {
              const file = item.getAsFile();
              if (file) {
                uploadFile(file).then((url) => {
                  // console.log(url);
                  const { schema } = view.state;
                  // console.log(schema);
                  const node = schema.nodes.image.create({ src: url });
                  const transaction = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(transaction);
                });
              }
              event.preventDefault();
            } else if (
              item.type === "application/pdf" ||
              item.type === "application/octet-stream"
            ) {
              const file = item.getAsFile();
              if (file) {
                uploadFile(file).then((url) => {
                  const { schema } = view.state;
                  const transaction = view.state.tr.replaceSelectionWith(
                    schema.text(`[${file.name}](${url})`)
                  );
                  view.dispatch(transaction);
                });
              }
              event.preventDefault();
            }
          }
        }
        return false;
      },
      handleDrop(view, event) {
        const hasFiles = event.dataTransfer?.files?.length;

        if (!hasFiles) {
          return false;
        }

        const files = Array.from(event.dataTransfer.files);
        event.preventDefault();

        files.forEach((file) => {
          if (
            file.type.startsWith("image/") ||
            file.type === "application/pdf"
          ) {
            setIsUploading(true);
            uploadFile(file)
              .then((url) => {
                if (file.type.startsWith("image/")) {
                  const { schema } = view.state;
                  const node = schema.nodes.image.create({ src: url });
                  const transaction = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(transaction);
                } else {
                  const transaction = view.state.tr.replaceSelectionWith(
                    view.state.schema.text(`[${file.name}](${url})`)
                  );
                  view.dispatch(transaction);
                }
                setIsUploading(false);
              })
              .catch(() => setIsUploading(false));
          }
        });

        return true;
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
      handleContentChange(editor.getHTML());
      // console.log(editor.getHTML());
    },
  });

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post(
        "https://kinscare-backend.onrender.com/api/v1/upload-file",
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
      setIsUploading(false);
      return "";
    }
  };

  const handleContentChange = (currentContent: string) => {
    const currentImages: any = extractUrls(currentContent);
    const removedImages = previousContent.filter(
      (url) => !currentImages.includes(url)
    );
    // console.log(removedImages)
    removedImages.forEach((url) => {
      // console.log(url)
      deleteFile(url);
    });

    setPreviousContent(currentImages);
  };

  const deleteFile = async (fileUrl: string) => {
    console.log(fileUrl, "delete the url");
    try {
      await axios.post(
        "https://kinscare-backend.onrender.com/api/v1/delete-file",
        { fileUrl }
      );
      console.log(`File deleted: ${fileUrl}`);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };
  const extractUrls = (content: string) => {
    // Define the base URL and file extensions to match
    const baseUrl = "fileupload-kinscare.s3.amazonaws.com";
    const fileExtensions = "jpeg|jpg|png|svg|pdf|octet-stream"; // Add more extensions if needed

    // Construct a regex pattern to match URLs containing the base URL and ending with the specified extensions
    const urlRegex = new RegExp(
      `https://${baseUrl}/[^\\s"'>]+\\.(?:${fileExtensions})(?=[\\s"'>]|$)`,
      "g"
    );

    return content.match(urlRegex) || [];
  };

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isUploading);
    }
  }, [editor, isUploading]);
  // console.log(previousContent)
  return (
    <>
        {usage === "posts" ? (
        <>
          <BubbleMenu editor={editor} tippyOptions={{ placement: "top-end" }}>
            <PostsToolBar editor={editor} />
          </BubbleMenu>
          <div className="discussion-content prose prose-p:m-0 prose-sm max-w-none p-3">
            <EditorContent editor={editor} />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col min-h-[300px] p-4 bg-gray-100 rounded-xl w-full">
            <div className="mb-2">
              {!isMobile ? (
                <div className="overflow-x-auto">
                  <ToolBar editor={editor} />
                </div>
              ) : (
                <FloatingMenu editor={editor} tippyOptions={{ placement: "top" }}>
                  <div className="overflow-x-auto">
                    <ToolBar editor={editor} />
                  </div>
                </FloatingMenu>
              )}
            </div>
            <div className="tiptap-resume prose-sm prose-p:m-0 max-w-none p-3">
              <EditorContent editor={editor} />
            </div>
          </div>
          <div className="mt-2">
            <WordCountAndRanking editor={editor} />
          </div>
        </>
      )}
    </>
  );
}

export default TextEditor;
