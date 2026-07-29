import { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { MonacoBinding } from 'y-monaco';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript', piston: 'javascript' },
  { id: 'typescript', label: 'TypeScript', monaco: 'typescript', piston: 'typescript' },
  { id: 'python', label: 'Python', monaco: 'python', piston: 'python' },
  { id: 'cpp', label: 'C++', monaco: 'cpp', piston: 'cpp' },
  { id: 'java', label: 'Java', monaco: 'java', piston: 'java' },
  { id: 'go', label: 'Go', monaco: 'go', piston: 'go' },
  { id: 'rust', label: 'Rust', monaco: 'rust', piston: 'rust' },
  { id: 'c', label: 'C', monaco: 'c', piston: 'c' },
];

// Piston language versions (latest stable)
const PISTON_VERSIONS = {
  javascript: '18.15.0',
  typescript: '5.0.3',
  python: '3.10.0',
  cpp: '10.2.0',
  java: '15.0.2',
  go: '1.16.2',
  rust: '1.68.2',
  c: '10.2.0',
};

export default function CodeEditor({ doc, roomId }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const bindingRef = useRef(null);

  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!doc || !containerRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value: '',
      language: 'javascript',
      theme: 'vs-dark',
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

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      monaco.editor.setModelLanguage(model, language);
    }
  }, [language]);

  // ---------- REAL MULTI-LANGUAGE RUN ----------
  const handleRun = async () => {
    const code = editorRef.current?.getValue() || '';
    if (!code.trim()) {
      setOutput('// No code to run');
      return;
    }

    setIsRunning(true);
    setOutput('⏳ Running...\n');

    try {
      // Client-side JavaScript / TypeScript (instant)
      if (language === 'javascript' || language === 'typescript') {
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
          logs.push('❌ ' + err.message);
        }

        console.log = originalLog;
        console.error = originalError;

        setOutput(logs.join('\n') || '(no output)');
        return;
      }

      // All other languages → Piston API
      const pistonLang = LANGUAGES.find((l) => l.id === language)?.piston || language;
      const version = PISTON_VERSIONS[pistonLang] || '*';

      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: pistonLang,
          version,
          files: [{ content: code }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Piston API error: ${response.status}`);
      }

      const data = await response.json();

      let result = '';

      if (data.run?.stdout) result += data.run.stdout;
      if (data.run?.stderr) result += (result ? '\n' : '') + '❌ ' + data.run.stderr;
      if (data.compile?.stderr) result += (result ? '\n' : '') + 'Compile Error:\n' + data.compile.stderr;

      if (!result.trim()) result = '(no output)';

      // Show exit code if non-zero
      if (data.run?.code !== 0 && data.run?.code !== undefined) {
        result += `\n\nProcess exited with code ${data.run.code}`;
      }

      setOutput(result);
    } catch (err) {
      setOutput('❌ Failed to run code:\n' + err.message + '\n\n(Make sure you have internet connection)');
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
      setOutput(`📂 Loaded from ${new Date(data.savedAt).toLocaleString()}`);
    } catch {
      setOutput('Failed to load saved file.');
    }
  };

  return (
    <div className="panel editor-panel">
      <div className="panel-header">
        <span>Code Editor</span>
        <span className="panel-badge">Monaco + Yjs</span>
      </div>

      <div className="editor-toolbar">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
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
        <div className="output-header">Output</div>
        <pre className="output-content">{output || '// output will appear here'}</pre>
      </div>
    </div>
  );
}