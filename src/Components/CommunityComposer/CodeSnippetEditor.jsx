
import { useContext, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";

import "./CodeSnippetEditor.css";
import { ThemeContext } from "../../Context/ThemeContext";

const languageOptions = {
  javascript: {
    label: "JavaScript",
    extension: () => javascript(),
  },
  jsx: {
    label: "JSX",
    extension: () => javascript({ jsx: true }),
  },
  typescript: {
    label: "TypeScript",
    extension: () => javascript({ typescript: true, jsx: true }),
  },
  python: {
    label: "Python",
    extension: () => python(),
  },
  html: {
    label: "HTML",
    extension: () => html(),
  },
  css: {
    label: "CSS",
    extension: () => css(),
  },
  json: {
    label: "JSON",
    extension: () => json(),
  },
  sql: {
    label: "SQL",
    extension: () => sql(),
  },
  java: {
    label: "Java",
    extension: () => java(),
  },
  cpp: {
    label: "C++",
    extension: () => cpp(),
  },
};

function CodeSnippetEditor({
  code = "",
  language = "javascript",
  onCodeChange,
  onLanguageChange,
}) {
  const [copied, setCopied] = useState(false);
  const { theme } = useContext(ThemeContext)
  const editorTheme = theme === "dark" ? oneDark : [];

  const selectedLanguage =
    languageOptions[language] || languageOptions.javascript;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      console.error("Failed to copy code.");
    }
  }

  return (
    <section className="code-snippet-editor">
      <div className="code-snippet-toolbar">
        <div className="code-snippet-language">
          <i className="fa-solid fa-code" />

          <select
            value={language}
            onChange={(event) =>
              onLanguageChange?.(event.target.value)
            }
            aria-label="Select programming language"
          >
            {Object.entries(languageOptions).map(([value, option]) => (
              <option key={value} value={value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="code-snippet-copy"
          onClick={handleCopy}
          disabled={!code}
        >
          <i
            className={`fa-regular ${copied ? "fa-circle-check" : "fa-copy"
              }`}
          />
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>

      <div className="code-snippet-editor-body">
        <CodeMirror
          value={code}
          theme={editorTheme}
          height="220px"
          extensions={[selectedLanguage.extension()]}
          onChange={(value) => onCodeChange?.(value)}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            autocompletion: true,
          }}
          placeholder="Write your code here..."
        />
      </div>

      <div className="code-snippet-footer">
        <span>
          <i className="fa-solid fa-circle-info" />
          Code preview
        </span>

        <span>{code.length} characters</span>
      </div>
    </section>
  );
}

export default CodeSnippetEditor;