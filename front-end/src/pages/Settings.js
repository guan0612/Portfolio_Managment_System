import React from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer';

const Settings = () => {
  const markdownContent = `
# Settings

Coming soon...
`;

  return <MarkdownRenderer content={markdownContent} />;
};

export default Settings;
