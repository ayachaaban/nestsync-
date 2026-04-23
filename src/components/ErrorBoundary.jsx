import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error('App render error:', error, info);
  }

  handleReset = () => {
    this.setState({ error: null, info: null });
  };

  handleClearStorage = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('nestsync_'))
      .forEach((k) => localStorage.removeItem(k));
    window.location.href = '/';
  };

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          maxWidth: '720px',
          margin: '40px auto',
          background: '#fff',
          border: '1px solid #f1c0c0',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ color: '#b03a2e', marginTop: 0 }}>Something broke while rendering</h2>
          <p style={{ color: '#555' }}>
            The page crashed. The actual error is below — copy it and send it to me, or click
            <strong> Clear Storage &amp; Restart</strong> if it&apos;s caused by stale saved data.
          </p>
          <pre style={{
            background: '#fdf2f2',
            color: '#922b21',
            padding: '12px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {String(this.state.error?.stack || this.state.error)}
          </pre>
          {this.state.info?.componentStack && (
            <details style={{ marginTop: '12px' }}>
              <summary style={{ cursor: 'pointer', color: '#666' }}>Component stack</summary>
              <pre style={{
                background: '#f7f7f7',
                color: '#555',
                padding: '12px',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '12px',
              }}>{this.state.info.componentStack}</pre>
            </details>
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={this.handleClearStorage}
              style={{
                padding: '10px 16px',
                background: '#3A6B8C',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Clear Storage &amp; Restart
            </button>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 16px',
                background: '#fff',
                color: '#3A6B8C',
                border: '1px solid #3A6B8C',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
