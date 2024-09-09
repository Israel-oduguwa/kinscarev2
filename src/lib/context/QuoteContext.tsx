'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface QuotedContent {
  id: string;
  content: string;
}

interface QuoteContextType {
  quotedContent: QuotedContent;
  setQuotedContent: (quote: QuotedContent) => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
};

export const QuoteProvider = ({ children }: { children: ReactNode }) => {
  const [quotedContent, setQuotedContent] = useState<QuotedContent>({ id: '', content: '' });

  return (
    <QuoteContext.Provider value={{ quotedContent, setQuotedContent }}>
      {children}
    </QuoteContext.Provider>
  );
};
