import { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { Play, Save, Upload, ChevronDown } from 'lucide-react';
import 'monaco-editor/min/vs/editor/editor.main.css';
import { MonacoBinding } from 'y-monaco';
import { useTheme } from '../context/ThemeContext';

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

      if (!result.trim()) result = '(no output)';

      // Show exit code if non-zero
      if (data.run?.code !== 0 && data.run?.code !== undefined) {
        result += `\n\nProcess exited with code ${data.run.code}`;
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

      {/* Premium toolbar */}
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

        <button className="btn-secondary" onClick={handleLoad}>
          <Upload size={14} style={{ marginRight: 6 }} />
          Load
        </button>
        <button className="btn-secondary" onClick={handleSave}>
          <Save size={14} style={{ marginRight: 6 }} />
          Save
        </button>

        <button
          className="btn-run"
          onClick={handleRun}
          disabled={isRunning}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Play size={14} fill="currentColor" />
          {isRunning ? 'Running…' : 'Run'}
        </button>
      </div>

      {/* Monaco */}
      <div
        ref={containerRef}
        className="editor-container"
        style={{ flex: 1, minHeight: 0 }}
      />

      {/* VS-Code style Output Console */}
      <div className="output-panel">
        <div className="output-header">Output</div>
        <pre className="output-content">{output || '// output will appear here'}</pre>
      </div>
    </div>
  );
}