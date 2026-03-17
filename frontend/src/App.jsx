import React, { useState } from 'react';
import './index.css';

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!url || (!url.includes('youtube.com/') && !url.includes('youtu.be/'))) {
      setError('Please provide a valid YouTube URL');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const endpoint = `${baseUrl}/api/download?url=${encodeURIComponent(url)}`;

      const a = document.createElement('a');
      a.href = endpoint;
      a.download = 'audio.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Reset UI after starting download
      setTimeout(() => {
        setIsLoading(false);
        setUrl('');
      }, 2500);

    } catch (err) {
      console.error(err);
      setError('An error occurred while initiating the download.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="app-container">
        <div className="glass-panel">

          <div className="header-wrapper">
            <h1 className="logo-text">Aura</h1>
            <p className="subtitle">Extraction. Redefined.</p>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              {/* Simple link icon SVG */}
              <svg className="url-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>

              <input
                type="url"
                className="url-input"
                placeholder="Paste your link here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                id="url-input"
              />
            </div>

            <button
              className="convert-btn"
              onClick={handleDownload}
              disabled={isLoading || !url}
              id="convert-btn"
            >
              {isLoading ? (
                <div className="loader-wrapper">
                  <span>Extracting Frequency</span>
                  <div className="audio-waves">
                    <div className="wave"></div>
                    <div className="wave"></div>
                    <div className="wave"></div>
                    <div className="wave"></div>
                    <div className="wave"></div>
                  </div>
                </div>
              ) : (
                <>
                  <span>Initialize Sequence</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </>
              )}
            </button>
          </div>

          <div className="status-area">
            {error && (
              <div className="error-msg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default App;
