import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../style/MarkdownRenderer.css';

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="markdown-container">
      <div className="markdown-content">
        <ReactMarkdown
          components={{
            h1: ({children, ...props}) => (
              children ? <h1 className="markdown-h1" {...props}>{children}</h1> : null
            ),
            h2: ({children, ...props}) => (
              children ? <h2 className="markdown-h2" {...props}>{children}</h2> : null
            ),
            h3: ({children, ...props}) => (
              children ? <h3 className="markdown-h3" {...props}>{children}</h3> : null
            ),
            p: ({children, ...props}) => (
              children ? <p className="markdown-p" {...props}>{children}</p> : null
            ),
            ul: ({children, ...props}) => (
              children ? <ul className="markdown-ul" {...props}>{children}</ul> : null
            ),
            ol: ({children, ...props}) => (
              children ? <ol className="markdown-ol" {...props}>{children}</ol> : null
            ),
            li: ({children, ...props}) => (
              children ? <li className="markdown-li" {...props}>{children}</li> : null
            ),
            strong: ({children, ...props}) => (
              children ? <strong className="markdown-strong" {...props}>{children}</strong> : null
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownRenderer;
