import React, { ReactNode } from 'react';
import Highlighter from 'react-highlight-words';

type HighlightProps = {
    children?: ReactNode;
    highlightIndex: number;
};

export const Highlight: React.FC<HighlightProps> = ({ children }: HighlightProps) => (
    <strong className="highlighted-text">{children}</strong>
);

type SplitHighlighterProps = {
    search: string;
    textToHighlight: string;
};

export const SplitHighlighter: React.FC<SplitHighlighterProps> = ({
    search: searchString,
    textToHighlight,
}: SplitHighlighterProps) => (
    <Highlighter
        searchWords={searchString.trim().split(/\s+/)}
        textToHighlight={textToHighlight ?? ''}
        autoEscape={true}
        highlightTag={Highlight}
    />
);
