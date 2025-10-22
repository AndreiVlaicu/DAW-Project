import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(error, info){ console.error('UI error', error, info); }
  render(){
    if (this.state.error) {
      return (
        <div style={{padding:16, background:'#fee', border:'1px solid #f99', borderRadius:8}}>
          <h3>A apărut o eroare în UI</h3>
          <pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.error?.message || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
