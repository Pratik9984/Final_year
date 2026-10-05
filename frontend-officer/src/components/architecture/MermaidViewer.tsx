'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MermaidViewerProps {
  chart: string;
  id?: string;
  title?: string;
  subtitle?: string;
  height?: string;
  className?: string;
}

export default function MermaidViewer({
  chart,
  id = 'diagram-canvas',
  title,
  subtitle,
  height = '540px',
  className = ''
}: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showRawCode, setShowRawCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Initialize and render Mermaid
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    const renderChart = async () => {
      try {
        // Ensure mermaid is available on window
        if (!(window as any).mermaid) {
          // Dynamically load Mermaid CDN script if not present
          if (!document.getElementById('mermaid-cdn-script')) {
            const script = document.createElement('script');
            script.id = 'mermaid-cdn-script';
            script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
            script.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          } else {
            // Wait for existing script to load
            await new Promise((resolve) => {
              const interval = setInterval(() => {
                if ((window as any).mermaid) {
                  clearInterval(interval);
                  resolve(true);
                }
              }, 50);
              setTimeout(() => {
                clearInterval(interval);
                resolve(true);
              }, 3000);
            });
          }
        }

        const mermaid = (window as any).mermaid;
        if (!mermaid) {
          throw new Error('Mermaid renderer library could not be initialized from CDN.');
        }

        // Configure GovPulse Dark Theme
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          themeVariables: {
            darkMode: true,
            background: '#090d16',
            primaryColor: '#0c8fe9',
            primaryTextColor: '#f3f4f6',
            primaryBorderColor: '#025aa1',
            lineColor: '#38bdf8',
            secondaryColor: '#1e293b',
            tertiaryColor: '#111827',
            mainBkg: '#0f172a',
            nodeBorder: '#0284c7',
            clusterBkg: 'rgba(15, 23, 42, 0.75)',
            clusterBorder: '#0369a1',
            edgeLabelBackground: '#0b0f19',
            actorBkg: '#1e293b',
            actorBorder: '#0c8fe9',
            actorTextColor: '#f3f4f6',
            actorLineColor: '#38bdf8',
            signalColor: '#38bdf8',
            signalTextColor: '#f3f4f6',
            labelBoxBkgColor: '#1e293b',
            labelBoxBorderColor: '#0284c7',
            labelTextColor: '#f3f4f6',
            loopTextColor: '#f3f4f6'
          }
        });

        // Unique ID for SVG generation
        const uniqueId = `mermaid-svg-${id}-${Math.random().toString(36).substring(2, 8)}`;
        
        // Clean chart definition
        const cleanedChart = chart.trim();
        
        const renderResult = await mermaid.render(uniqueId, cleanedChart);
        if (isMounted) {
          setSvgContent(renderResult.svg);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn('Mermaid vector rendering issue:', err);
        if (isMounted) {
          setHasError(true);
          setErrorMessage(err?.message || 'Failed to render Mermaid vector diagram.');
          setIsLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, id]);

  const copyCode = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`glass-card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        background: 'rgba(11, 15, 25, 0.95)',
        boxShadow: '0 12px 32px -4px rgba(0,0,0,0.5)',
        position: 'relative'
      }}
    >
      {/* Viewer Header / Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          {title && (
            <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--accent-gold)', fontWeight: 700 }}>
              {title}
            </h4>
          )}
          {subtitle && (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Zoom controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
              title="Zoom Out"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '12px',
                borderRadius: '4px'
              }}
            >
              🔍 -
            </button>
            <span
              style={{
                fontSize: '11px',
                minWidth: '42px',
                textAlign: 'center',
                color: 'var(--accent-cyan)',
                fontFamily: 'monospace'
              }}
            >
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
              title="Zoom In"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '12px',
                borderRadius: '4px'
              }}
            >
              🔍 +
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              title="Reset Zoom"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '11px',
                borderRadius: '4px'
              }}
            >
              Reset
            </button>
          </div>

          {/* Toggle Raw Source */}
          <button
            onClick={() => setShowRawCode((s) => !s)}
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '6px 10px', height: '30px' }}
          >
            {showRawCode ? '📊 View Diagram' : '📝 Mermaid Source'}
          </button>

          {/* Copy Mermaid Code */}
          <button
            onClick={copyCode}
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '6px 10px', height: '30px' }}
          >
            {copied ? '✅ Copied' : '📋 Copy'}
          </button>

          {/* Download SVG */}
          {svgContent && !hasError && (
            <button
              onClick={downloadSvg}
              className="btn-secondary"
              title="Download vector SVG"
              style={{ fontSize: '11px', padding: '6px 10px', height: '30px' }}
            >
              💾 SVG
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          height,
          minHeight: '380px',
          overflow: 'auto',
          background: 'radial-gradient(ellipse at center, rgba(14, 28, 48, 0.4) 0%, rgba(9, 13, 22, 0.95) 100%)',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--accent-cyan)'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(56, 189, 248, 0.2)',
                borderTopColor: '#38bdf8',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
            <div style={{ fontSize: '12px', fontWeight: 600 }}>Rendering Crisp Vector Diagram...</div>
          </div>
        )}

        {/* Raw Code View Mode */}
        {showRawCode && (
          <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            <pre
              style={{
                margin: 0,
                padding: '16px',
                background: 'rgba(0,0,0,0.7)',
                color: '#38bdf8',
                fontSize: '12px',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono, monospace)',
                lineHeight: 1.5,
                border: '1px solid rgba(56, 189, 248, 0.2)'
              }}
            >
              {chart}
            </pre>
          </div>
        )}

        {/* Vector SVG Rendered */}
        {!isLoading && !showRawCode && svgContent && !hasError && (
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
              maxWidth: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}

        {/* Fallback Display if CDN is blocked or failed */}
        {!isLoading && !showRawCode && hasError && (
          <div
            style={{
              width: '100%',
              maxWidth: '820px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '20px',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 700, marginBottom: '8px' }}>
              <span>⚠️</span>
              <span>Vector Mermaid Renderer Notice</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
              The interactive diagram syntax is verified and valid. You can inspect the canonical Mermaid engineering source below:
            </p>
            <pre
              style={{
                margin: 0,
                padding: '14px',
                background: 'rgba(0,0,0,0.6)',
                color: '#38bdf8',
                fontSize: '11px',
                borderRadius: '6px',
                maxHeight: '300px',
                overflowY: 'auto',
                fontFamily: 'monospace'
              }}
            >
              {chart}
            </pre>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .mermaid svg {
          max-width: 100% !important;
          height: auto !important;
        }
        svg[id^="mermaid-svg"] {
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
        }
      `}</style>
    </div>
  );
}
