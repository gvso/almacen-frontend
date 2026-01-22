import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEffect } from "react";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Link as LinkIcon,
    Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Custom FontSize extension
declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        fontSize: {
            setFontSize: (size: string) => ReturnType;
            unsetFontSize: () => ReturnType;
        };
    }
}

const FontSize = Extension.create({
    name: "fontSize",

    addOptions() {
        return {
            types: ["textStyle"],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element) => element.style.fontSize?.replace(" !important", "") || null,
                        renderHTML: (attributes) => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize} !important`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontSize:
                (fontSize: string) =>
                    ({ chain }) => {
                        return chain().setMark("textStyle", { fontSize }).run();
                    },
            unsetFontSize:
                () =>
                    ({ chain }) => {
                        return chain()
                            .setMark("textStyle", { fontSize: null })
                            .unsetMark("textStyle")
                            .run();
                    },
        };
    },
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = "Write something...",
    className,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
                blockquote: false,
                horizontalRule: false,
            }),
            TextStyle,
            FontSize,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline",
                },
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm prose-stone max-w-none min-h-[120px] px-3 py-2 focus:outline-none [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_li_p]:my-0 [&_li]:marker:text-stone-800 [&_span]:text-[length:inherit]",
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            // Return empty string if the editor only contains an empty paragraph
            const isEmpty = html === "<p></p>" || html === "";
            onChange(isEmpty ? "" : html);
        },
    });

    // Sync external value changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("Enter URL", previousUrl);

        if (url === null) return;

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    return (
        <div
            className={cn(
                "rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring",
                className
            )}
        >
            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b border-input px-2 py-1.5">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <div className="mx-1 h-5 w-px bg-border" />
                {/* Font Size Selector */}
                <select
                    value={editor.getAttributes("textStyle").fontSize || "0.85rem"}
                    onChange={(e) => {
                        editor.chain().focus().setFontSize(e.target.value).run();
                    }}
                    className="h-7 rounded border border-input bg-transparent px-2 text-sm hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
                    title="Font Size"
                >
                    <option value="0.85rem">Small</option>
                    <option value="1rem">Medium</option>
                    <option value="1.125rem">Large</option>
                </select>
                <div className="mx-1 h-5 w-px bg-border" />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <div className="mx-1 h-5 w-px bg-border" />
                <ToolbarButton
                    onClick={setLink}
                    isActive={editor.isActive("link")}
                    title="Add Link"
                >
                    <LinkIcon className="h-4 w-4" />
                </ToolbarButton>
                {editor.isActive("link") && (
                    <ToolbarButton
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        title="Remove Link"
                    >
                        <Unlink className="h-4 w-4" />
                    </ToolbarButton>
                )}
            </div>

            {/* Editor content */}
            <div className="relative">
                <EditorContent editor={editor} />
                {editor.isEmpty && (
                    <p className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">
                        {placeholder}
                    </p>
                )}
            </div>
        </div>
    );
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    title: string;
    children: React.ReactNode;
}

function ToolbarButton({
    onClick,
    isActive,
    title,
    children,
}: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                "rounded p-1.5 hover:bg-muted transition-colors",
                isActive && "bg-action/15 text-action"
            )}
        >
            {children}
        </button>
    );
}
