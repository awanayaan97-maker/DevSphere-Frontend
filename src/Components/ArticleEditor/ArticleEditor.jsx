
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import "./ArticleEditor.css";
import useCallApi from "../../hooks/useCallApi";

function ArticleEditor({ setInputData, inputData, token, ApiUrl }) {

    const { callApi } = useCallApi();

    const editor = useEditor({
        extensions: [
            StarterKit,

            Link.configure({
                openOnClick: false,
            }),

            Image.configure({
                resize: {
                    enabled: true,
                },
            }),

            Table.configure({
                resizable: true,
            }),

            TableRow,
            TableHeader,
            TableCell,

        ],

        content: inputData.content,

        onUpdate: ({ editor }) => {
            setInputData(prevData => ({ ...prevData, content: editor.getHTML() }))
        }
    });

    if (!editor) {
        return null;
    }

    console.log(inputData);

    async function handleImageUpload(e) {

        const file = e.target.files[0];

        if (!file) return null

        const formData = new FormData();
        formData.append("articleImage", file)

        const result = await callApi(`${ApiUrl}/api/article/image-upload`, "POST", formData, token);

        if (result.data) {
            editor.chain().focus().setImage({ src: result.data }).run();
        }
    }

    return (
        <div className="article-editor">

            {/* TOOLBAR */}
            <div className="article-editor-toolbar">

                {/* TEXT FORMATTING */}
                <div className="toolbar-group">

                    <button
                        type="button"
                        className={editor.isActive("bold") ? "toolbar-btn active" : "toolbar-btn"}
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                        title="Bold"
                    >
                        <i className="fa-solid fa-bold"></i>
                    </button>

                    <button
                        type="button"
                        className={editor.isActive("italic") ? "toolbar-btn active" : "toolbar-btn"}
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        title="Italic"
                    >
                        <i className="fa-solid fa-italic"></i>
                    </button>

                    <button
                        type="button"
                        className={editor.isActive("strike") ? "toolbar-btn active" : "toolbar-btn"}
                        onClick={() =>
                            editor.chain().focus().toggleStrike().run()
                        }
                        title="Strike"
                    >
                        <i className="fa-solid fa-strikethrough"></i>
                    </button>

                </div>


                {/* HEADINGS */}
                <div className="toolbar-group">

                    <button
                        type="button"
                        className={editor.isActive("heading", { level: 2 }) ? "toolbar-btn active" : "toolbar-btn"}
                        onClick={() =>
                            editor.chain().focus().toggleHeading({ level: 2 }).run()
                        }
                        title="Heading 2"
                    >
                        H2
                    </button>

                    <button
                        type="button"
                        className={editor.isActive("heading", { level: 3 }) ? "toolbar-btn active" : "toolbar-btn"}
                        onClick={() =>
                            editor.chain().focus().toggleHeading({ level: 3 }).run()
                        }
                        title="Heading 3"
                    >
                        H3
                    </button>

                </div>


                {/* LISTS */}
                <div className="toolbar-group">

                    <button
                        type="button"
                        className={editor.isActive("bulletList") ? "toolbar-btn active" : "toolbar-btn"}
                        onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                        }
                        title="Bullet List"
                    >
                        <i className="fa-solid fa-list-ul"></i>
                    </button>

                    <button
                        type="button"
                        className={editor.isActive("orderedList") ? "toolbar-btn active" : "toolbar-btn"}
                        onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                        }
                        title="Numbered List"
                    >
                        <i className="fa-solid fa-list-ol"></i>
                    </button>

                </div>


                <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .insertTable({
                                rows: 3,
                                cols: 3,
                                withHeaderRow: true,
                            })
                            .run()
                    }
                    title="Insert Table"
                >
                    <i className="fa-solid fa-table"></i>
                </button>




                <button
                    type="button"
                    className="image-upload-button"
                    onClick={() =>
                        document.getElementById("article-image-input").click()
                    }
                >
                    <i className="fa-regular fa-image"></i>
                </button>

                <input
                    id="article-image-input"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                />

                {/* BLOCKS */}
                <div className="toolbar-group">

                    <button
                        type="button"
                        className={editor.isActive("blockquote") ? "toolbar-btn active" : "toolbar-btn"}
                        onClick={() =>
                            editor.chain().focus().toggleBlockquote().run()
                        }
                        title="Blockquote"
                    >
                        <i className="fa-solid fa-quote-left"></i>
                    </button>

                    <button
                        type="button"
                        className={editor.isActive("code") ? "toolbar-btn active" : "toolbar-btn"}
                        onClick={() =>
                            editor.chain().focus().toggleCode().run()
                        }
                        title="Inline Code"
                    >
                        <i className="fa-solid fa-code"></i>
                    </button>





                    <button
                        type="button"
                        className={editor.isActive("codeBlock") ? "toolbar-btn active" : "toolbar-btn"}
                        onClick={() =>
                            editor.chain().focus().toggleCodeBlock().run()
                        }
                        title="Code Block"
                    >
                        <i className="fa-solid fa-terminal"></i>
                    </button>

                    <button
                        type="button"
                        className="toolbar-btn"
                        onClick={() =>
                            editor.chain().focus().setHorizontalRule().run()
                        }
                        title="Horizontal Rule"
                    >
                        <i className="fa-solid fa-minus"></i>
                    </button>

                </div>


                <button
                    type="button"
                    className={
                        editor.isActive("link")
                            ? "toolbar-btn active"
                            : "toolbar-btn"
                    }
                    onClick={() => {
                        const url = window.prompt("Enter URL");

                        if (!url) return;

                        editor
                            .chain()
                            .focus()
                            .extendMarkRange("link")
                            .setLink({ href: url })
                            .run();
                    }}
                    title="Add Link"
                >
                    <i className="fa-solid fa-link"></i>
                </button>


                {/* HISTORY */}
                <div className="toolbar-group toolbar-history">

                    <button
                        type="button"
                        className="toolbar-btn"
                        onClick={() =>
                            editor.chain().focus().undo().run()
                        }
                        disabled={!editor.can().undo()}
                        title="Undo"
                    >
                        <i className="fa-solid fa-rotate-left"></i>
                    </button>

                    <button
                        type="button"
                        className="toolbar-btn"
                        onClick={() =>
                            editor.chain().focus().redo().run()
                        }
                        disabled={!editor.can().redo()}
                        title="Redo"
                    >
                        <i className="fa-solid fa-rotate-right"></i>
                    </button>

                </div>


                {/* CLEAR FORMAT */}
                <div className="toolbar-group">

                    <button
                        type="button"
                        className="toolbar-btn"
                        onClick={() =>
                            editor.chain().focus().clearNodes().unsetAllMarks().run()
                        }
                        title="Clear Formatting"
                    >
                        <i className="fa-solid fa-eraser"></i>
                    </button>

                </div>

            </div>


            {/* EDITOR CONTENT */}
            <div className="article-editor-content">
                <EditorContent editor={editor} />
            </div>

        </div>
    );
}

export default ArticleEditor;