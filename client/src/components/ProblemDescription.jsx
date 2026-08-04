import React, { useState } from 'react';

export default function ProblemDescription({ problem }) {
  const [activeTab, setActiveTab] = useState('statement');
  const [userNote, setUserNote] = useState('');

  if (!problem) return null;

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'text-[#00b8a3] bg-[#00b8a3]/10 border-[#00b8a3]/30';
      case 'Medium':
        return 'text-[#ffa116] bg-[#ffa116]/10 border-[#ffa116]/30';
      case 'Hard':
        return 'text-[#ff375f] bg-[#ff375f]/10 border-[#ff375f]/30';
      default:
        return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  return (
    <div className="problem-description-container">
      {/* Description Sub-tabs */}
      <div className="problem-subnav">
        <button
          className={`problem-subnav-btn ${activeTab === 'statement' ? 'active' : ''}`}
          onClick={() => setActiveTab('statement')}
        >
          📄 Description
        </button>
        <button
          className={`problem-subnav-btn ${activeTab === 'solutions' ? 'active' : ''}`}
          onClick={() => setActiveTab('solutions')}
        >
          💡 Editorial & Approach
        </button>
        <button
          className={`problem-subnav-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 Notes
        </button>
      </div>

      <div className="problem-content scrollable">
        {activeTab === 'statement' && (
          <div className="statement-body">
            <div className="problem-header-row">
              <h2 className="problem-title">{problem.title}</h2>
              <span className={`difficulty-badge ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <span className="category-tag">🏷️ {problem.category}</span>
            </div>

            <div className="problem-text-block">
              {problem.description.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Examples */}
            <div className="examples-section">
              <h3>Examples:</h3>
              {problem.examples.map((ex, idx) => (
                <div key={idx} className="example-card">
                  <div className="example-title">Example {idx + 1}:</div>
                  <div className="example-code">
                    <div><strong>Input:</strong> {ex.input}</div>
                    <div><strong>Output:</strong> {ex.output}</div>
                    {ex.explanation && <div><strong>Explanation:</strong> {ex.explanation}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Constraints */}
            {problem.constraints && (
              <div className="constraints-section">
                <h3>Constraints:</h3>
                <ul>
                  {problem.constraints.map((c, idx) => (
                    <li key={idx}><code>{c}</code></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'solutions' && (
          <div className="solutions-body">
            <h3>Editorial & Complexity Analysis</h3>
            <div className="editorial-card">
              <h4>Optimal Approach (Hash Map / Two Pointers)</h4>
              <p>
                To achieve optimal performance, use a single-pass hash map to store elements and their array indices.
              </p>
              <div className="complexity-box">
                <div>⚡ <strong>Time Complexity:</strong> O(N)</div>
                <div>💾 <strong>Space Complexity:</strong> O(N)</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="notes-body">
            <h3>Interview Notes & Scratchpad</h3>
            <textarea
              className="notes-textarea"
              placeholder="Write personal interview notes or code ideas here..."
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
