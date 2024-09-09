"use client";

import React from "react";
import { useQuote } from "@/lib/context/QuoteContext";
interface QuoteButtonProps {
  id: string; // ID of the post/comment being quoted
  content: string; // Content being quoted
}

const QuoteButton: React.FC<QuoteButtonProps> = ({ id, content }) => {
  const { setQuotedContent } = useQuote();
  // console.log(id, "quoted id");
  const handleQuote = () => {
    const formattedQuote = `<blockquote class="forum-quote-block">${content}</blockquote>`;
    setQuotedContent({ id, content: formattedQuote });
  };

  return <button className="text-md text-gray-600" onClick={handleQuote}>Quote Reply</button>;
};

export default QuoteButton;
