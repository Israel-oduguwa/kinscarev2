"use client";
import React, { useState } from "react";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
polyfill();

interface RichTextProps {
  truncatedContent: string; // Truncated HTML content
  fullContent: string; // Full HTML content
}

const RichTextRendering: React.FC<RichTextProps> = ({
  truncatedContent,
  fullContent,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle the state between expanded and collapsed content
  const handleToggleContent = () => {
    setIsExpanded((prevState) => !prevState);
  };

  return (
    <div className="prose prose-h1:mx-2 prose-h2:mx-2">
      {/* Render truncated or full HTML content based on the state */}
      <Interweave content={isExpanded ? fullContent : truncatedContent} />

      {/* Toggle button to show more or show less */}
      {fullContent !== truncatedContent && (
        <button
          onClick={handleToggleContent}
          className="mt-2 text-blue-500 hover:text-blue-700"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};

export default RichTextRendering;
