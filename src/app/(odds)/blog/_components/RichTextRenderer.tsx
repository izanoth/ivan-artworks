import React from 'react';

interface RichTextRendererProps {
  text: string;
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ text }) => {
  if (!text) {
    return null;
  }

  const parts = text.split(/(\*[^*]+\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          // Render italic text
          return <em key={index}>{part.substring(1, part.length - 1)}</em>;
        } else {
          // Render plain text
          return <React.Fragment key={index}>{part}</React.Fragment>;
        }
      })}
    </>
  );
};

export default RichTextRenderer;