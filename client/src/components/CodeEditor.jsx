import { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import 'monaco-editor/min/vs/editor/editor.main.css';
import { MonacoBinding } from 'y-monaco';
import { useTheme } from '../context/ThemeContext';

const LANGUAGES = [
  {
    id: 'javascript',
    label: 'JavaScript',
    monaco: 'javascript',
    piston: 'javascript',
    fileName: 'main.js',
    defaultCode: '// JavaScript\nconsole.log("Hello from SyncSpace!");\n\nfunction sum(a, b) {\n  return a + b;\n}\nconsole.log("Sum:", sum(5, 7));\n',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    monaco: 'typescript',
    piston: 'typescript',
    fileName: 'main.ts',
    defaultCode: '// TypeScript\nconst greeting: string = "Hello from SyncSpace!";\nconsole.log(greeting);\n\nfunction add(a: number, b: number): number {\n  return a + b;\n}\nconsole.log("Result:", add(10, 20));\n',
  },
  {
    id: 'python',
    label: 'Python 3',
    monaco: 'python',
    piston: 'python',
    fileName: 'main.py',
    defaultCode: '# Python 3\nprint("Hello from SyncSpace!")\n\ndef sum_nums(a, b):\n    return a + b\n\nprint("Sum:", sum_nums(15, 25))\n',
  },
  {
    id: 'cpp',
    label: 'C++',
    monaco: 'cpp',
    piston: 'cpp',
    fileName: 'main.cpp',
    defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from SyncSpace C++!" << endl;\n    int a = 10, b = 20;\n    cout << "Sum: " << (a + b) << endl;\n    return 0;\n}\n',
  },
  {
    id: 'java',
    label: 'Java',
    monaco: 'java',
    piston: 'java',
    fileName: 'Main.java',
    defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from SyncSpace Java!");\n        int sum = add(8, 12);\n        System.out.println("Sum: " + sum);\n    }\n\n    public static int add(int a, int b) {\n        return a + b;\n    }\n}\n',
  },
  {
    id: 'go',
    label: 'Go',
    monaco: 'go',
    piston: 'go',
    fileName: 'main.go',
    defaultCode: 'package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from SyncSpace Go!")\n    fmt.Println("Sum:", 40+2) \n}\n',
  },
  {
    id: 'rust',
    label: 'Rust',
    monaco: 'rust',
    piston: 'rust',
    fileName: 'main.rs',
    defaultCode: 'fn main() {\n    println!("Hello from SyncSpace Rust!");\n    let sum = 50 + 50;\n    println!("Sum: {}", sum);\n}\n',
  },
  {
    id: 'c',
    label: 'C',
    monaco: 'c',
    piston: 'c',
    fileName: 'main.c',
    defaultCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello from SyncSpace C!\\n");\n    int a = 5, b = 15;\n    printf("Sum: %d\\n", a + b);\n    return 0;\n}\n',
  },
];

export default function CodeEditor({ doc, roomId }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const bindingRef = useRef(null);

  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!doc || !containerRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value: '',
      language: 'javascript',
      theme: resolvedTheme === 'dark' ? 'vs-dark' : 'vs',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      padding: { top: 12 },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      tabSize: 2,
    });

    editorRef.current = editor;

    const yText = doc.getText('monaco');
    bindingRef.current = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      null
    );

    return () => {
      bindingRef.current?.destroy();
      editor.dispose();
    };
  }, [doc]);

  // Sync Monaco editor theme when global resolvedTheme changes
  useEffect(() => {
    monaco.editor.setTheme(resolvedTheme === 'dark' ? 'vs-dark' : 'vs');
  }, [resolvedTheme]);

  // Sync Monaco syntax highlighting when language state updates
  useEffect(() => {
    if (editorRef.current) {
      const selectedLang = LANGUAGES.find((l) => l.id === language);
      const model = editorRef.current.getModel();
      if (model && selectedLang) {
        monaco.editor.setModelLanguage(model, selectedLang.monaco);
      }
    }
  }, [language]);

  const handleLanguageChange = (newLangId) => {
    setLanguage(newLangId);
    const langObj = LANGUAGES.find((l) => l.id === newLangId);
    if (!langObj || !editorRef.current) return;

    const currentCode = editorRef.current.getValue().trim();
    // If editor is empty, automatically load starter code template for the chosen language
    if (!currentCode) {
      editorRef.current.setValue(langObj.defaultCode);
    }
  };

  const handleLoadTemplate = () => {
    const langObj = LANGUAGES.find((l) => l.id === language);
    if (langObj && editorRef.current) {
      editorRef.current.setValue(langObj.defaultCode);
      setOutput(`✨ Loaded starter template for ${langObj.label}`);
    }
  };

  // ---------- MULTI-LANGUAGE RUNNER ----------
  const handleRun = async () => {
    const code = editorRef.current?.getValue() || '';
    if (!code.trim()) {
      setOutput('// No code to run');
      return;
    }

    const currentLangObj = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];
    setIsRunning(true);
    setOutput(`⏳ Compiling & Running ${currentLangObj.label}...\n`);

    try {
      // 1. Client-Side Instant Run for pure JavaScript (no TypeScript types)
      if (language === 'javascript') {
        const logs = [];
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => logs.push(args.map(String).join(' '));
        console.error = (...args) => logs.push('Error: ' + args.map(String).join(' '));

        try {
          // eslint-disable-next-line no-new-func
          const result = new Function(code)();
          if (result !== undefined) logs.push(String(result));
        } catch (err) {
          logs.push('❌ Runtime Error: ' + err.message);
        }

        console.log = originalLog;
        console.error = originalError;

        setOutput(logs.join('\n') || '(code executed successfully with no output)');
        return;
      }

      // 2. All other languages (Python, C++, Java, Go, Rust, C, TypeScript) -> Piston Execution Engine
      let data = null;

      // Try server proxy endpoint first
      try {
        const proxyRes = await fetch('http://localhost:5000/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: currentLangObj.piston,
            code,
            fileName: currentLangObj.fileName,
          }),
        });

        if (proxyRes.ok) {
          data = await proxyRes.json();
        }
      } catch (proxyErr) {
        console.warn('Backend proxy unreachable, falling back to direct Piston API call:', proxyErr);
      }

      // Direct Piston API fallback if server proxy unavailable
      if (!data) {
        const pistonRes = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: currentLangObj.piston,
            version: '*',
            files: [{ name: currentLangObj.fileName, content: code }],
          }),
        });

        if (!pistonRes.ok) {
          throw new Error(`Execution service error (Status ${pistonRes.status})`);
        }

        data = await pistonRes.json();
      }

      let result = '';

      if (data.compile?.stderr) {
        result += '❌ Compilation Error:\n' + data.compile.stderr + '\n\n';
      }

      if (data.run?.stdout) {
        result += data.run.stdout;
      }

      if (data.run?.stderr) {
        result += (result ? '\n' : '') + '❌ Runtime Error:\n' + data.run.stderr;
      }

      if (!result.trim()) {
        result = '(code executed with no output)';
      }

      if (data.run?.code !== undefined && data.run?.code !== 0) {
        result += `\n\n[Process exited with return code ${data.run.code}]`;
      }

      setOutput(result);
    } catch (err) {
      setOutput(`❌ Execution Failed:\n${err.message}\n\nPlease check your internet connection.`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSave = () => {
    const code = editorRef.current?.getValue() || '';
    const data = {
      code,
      language,
      roomId,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`syncspace_code_${roomId}`, JSON.stringify(data));
    setOutput('✅ File saved locally!\n' + new Date().toLocaleString());
  };

  const handleLoad = () => {
    const raw = localStorage.getItem(`syncspace_code_${roomId}`);
    if (!raw) {
      setOutput('No saved file found for this room.');
      return;
    }
    try {
      const data = JSON.parse(raw);
      editorRef.current?.setValue(data.code || '');
      setLanguage(data.language || 'javascript');
      setOutput(`📂 Loaded saved code from ${new Date(data.savedAt).toLocaleString()}`);
    } catch {
      setOutput('Failed to load saved file.');
    }
  };

  return (
    <div className="panel editor-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span>Code Editor</span>
        <span className="panel-badge">Monaco Multi-Lang</span>
      </div>

      <div className="editor-toolbar">
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="lang-select"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>

        <button className="btn-run" onClick={handleRun} disabled={isRunning}>
          {isRunning ? 'Running…' : '▶ Run'}
        </button>
        <button className="btn-secondary" onClick={handleLoadTemplate} title="Insert boilerplate code for selected language">
          📜 Template
        </button>
        <button className="btn-secondary" onClick={handleSave}>
          💾 Save
        </button>
        <button className="btn-secondary" onClick={handleLoad}>
          📂 Load
        </button>
      </div>

      <div
        ref={containerRef}
        className="editor-container"
        style={{ flex: 1, minHeight: 0 }}
      />

      <div className="output-panel">
        <div className="output-header">Console Output ({LANGUAGES.find(l => l.id === language)?.label})</div>
        <pre className="output-content">{output || '// Output will appear here after clicking ▶ Run'}</pre>
      </div>
    </div>
  );
}