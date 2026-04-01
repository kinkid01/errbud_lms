"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { Box, HStack, IconButton, Tooltip, Divider, Select } from "@chakra-ui/react";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
} from "react-icons/fi";
import { MdFormatListNumbered, MdFormatQuote, MdFormatClear } from "react-icons/md";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Black", value: "#000000" },
  { label: "Gray", value: "#6b7280" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Yellow", value: "#eab308" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#a855f7" },
];

const HEADING_OPTIONS = [
  { label: "Normal text", value: "paragraph" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. when form resets)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", false);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null;

  const activeHeading = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
    ? "h3"
    : "paragraph";

  const handleHeading = (val: string) => {
    if (val === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(val.replace("h", "")) as 1 | 2 | 3;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
      {/* Toolbar */}
      <Box bg="gray.50" borderBottom="1px solid" borderColor="gray.200" px={2} py={1}>
        <HStack spacing={1} flexWrap="wrap">
          {/* Heading selector */}
          <Select
            size="xs"
            value={activeHeading}
            onChange={(e) => handleHeading(e.target.value)}
            w="120px"
            borderRadius="md"
          >
            {HEADING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>

          <Divider orientation="vertical" h="24px" />

          {/* Bold */}
          <Tooltip label="Bold">
            <IconButton
              aria-label="Bold"
              icon={<FiBold />}
              size="xs"
              variant={editor.isActive("bold") ? "solid" : "ghost"}
              colorScheme={editor.isActive("bold") ? "blue" : "gray"}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
          </Tooltip>

          {/* Italic */}
          <Tooltip label="Italic">
            <IconButton
              aria-label="Italic"
              icon={<FiItalic />}
              size="xs"
              variant={editor.isActive("italic") ? "solid" : "ghost"}
              colorScheme={editor.isActive("italic") ? "blue" : "gray"}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
          </Tooltip>

          {/* Underline */}
          <Tooltip label="Underline">
            <IconButton
              aria-label="Underline"
              icon={<FiUnderline />}
              size="xs"
              variant={editor.isActive("underline") ? "solid" : "ghost"}
              colorScheme={editor.isActive("underline") ? "blue" : "gray"}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
          </Tooltip>

          <Divider orientation="vertical" h="24px" />

          {/* Bullet list */}
          <Tooltip label="Bullet list">
            <IconButton
              aria-label="Bullet list"
              icon={<FiList />}
              size="xs"
              variant={editor.isActive("bulletList") ? "solid" : "ghost"}
              colorScheme={editor.isActive("bulletList") ? "blue" : "gray"}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
          </Tooltip>

          {/* Numbered list */}
          <Tooltip label="Numbered list">
            <IconButton
              aria-label="Numbered list"
              icon={<MdFormatListNumbered />}
              size="xs"
              variant={editor.isActive("orderedList") ? "solid" : "ghost"}
              colorScheme={editor.isActive("orderedList") ? "blue" : "gray"}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
          </Tooltip>

          {/* Blockquote */}
          <Tooltip label="Blockquote">
            <IconButton
              aria-label="Blockquote"
              icon={<MdFormatQuote />}
              size="xs"
              variant={editor.isActive("blockquote") ? "solid" : "ghost"}
              colorScheme={editor.isActive("blockquote") ? "blue" : "gray"}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
          </Tooltip>

          <Divider orientation="vertical" h="24px" />

          {/* Align left */}
          <Tooltip label="Align left">
            <IconButton
              aria-label="Align left"
              icon={<FiAlignLeft />}
              size="xs"
              variant={editor.isActive({ textAlign: "left" }) ? "solid" : "ghost"}
              colorScheme={editor.isActive({ textAlign: "left" }) ? "blue" : "gray"}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            />
          </Tooltip>

          {/* Align center */}
          <Tooltip label="Align center">
            <IconButton
              aria-label="Align center"
              icon={<FiAlignCenter />}
              size="xs"
              variant={editor.isActive({ textAlign: "center" }) ? "solid" : "ghost"}
              colorScheme={editor.isActive({ textAlign: "center" }) ? "blue" : "gray"}
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
            />
          </Tooltip>

          {/* Align right */}
          <Tooltip label="Align right">
            <IconButton
              aria-label="Align right"
              icon={<FiAlignRight />}
              size="xs"
              variant={editor.isActive({ textAlign: "right" }) ? "solid" : "ghost"}
              colorScheme={editor.isActive({ textAlign: "right" }) ? "blue" : "gray"}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            />
          </Tooltip>

          <Divider orientation="vertical" h="24px" />

          {/* Text color */}
          <Tooltip label="Text color">
            <Box position="relative">
              <select
                style={{
                  fontSize: "12px",
                  padding: "2px 4px",
                  borderRadius: "4px",
                  border: "1px solid #e2e8f0",
                  background: "white",
                  cursor: "pointer",
                }}
                value={editor.getAttributes("textStyle").color ?? ""}
                onChange={(e) => {
                  if (e.target.value) {
                    editor.chain().focus().setColor(e.target.value).run();
                  } else {
                    editor.chain().focus().unsetColor().run();
                  }
                }}
              >
                {TEXT_COLORS.map((c) => (
                  <option key={c.value} value={c.value} style={{ color: c.value || "inherit" }}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Box>
          </Tooltip>

          <Divider orientation="vertical" h="24px" />

          {/* Clear formatting */}
          <Tooltip label="Clear formatting">
            <IconButton
              aria-label="Clear formatting"
              icon={<MdFormatClear />}
              size="xs"
              variant="ghost"
              colorScheme="gray"
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            />
          </Tooltip>
        </HStack>
      </Box>

      {/* Editor area */}
      <Box
        sx={{
          ".ProseMirror": {
            minH: "200px",
            p: 3,
            outline: "none",
            fontSize: "14px",
            lineHeight: "1.7",
            color: "gray.700",
          },
          ".ProseMirror h1": { fontSize: "1.5em", fontWeight: "bold", my: 2 },
          ".ProseMirror h2": { fontSize: "1.3em", fontWeight: "bold", my: 2 },
          ".ProseMirror h3": { fontSize: "1.1em", fontWeight: "bold", my: 2 },
          ".ProseMirror ul": { pl: 5, listStyleType: "disc" },
          ".ProseMirror ol": { pl: 5, listStyleType: "decimal" },
          ".ProseMirror blockquote": {
            borderLeft: "3px solid",
            borderColor: "blue.300",
            pl: 3,
            color: "gray.500",
            fontStyle: "italic",
            my: 2,
          },
          ".ProseMirror p.is-editor-empty:first-of-type::before": {
            content: "attr(data-placeholder)",
            color: "gray.400",
            pointerEvents: "none",
            float: "left",
            height: 0,
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};

export default RichTextEditor;
