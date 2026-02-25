import { memo, useMemo } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function parseMarkdownIntoBlocks(markdown: string): string[] {
  // Split by double newlines to preserve table structure
  return markdown.split('\n\n').filter(block => block.trim());
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
  },
  (prevProps, nextProps) => {
    return prevProps.content === nextProps.content;
  },
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

export const MemoizedMarkdown = memo(  ({ content, id }: { content: string; id: string }) => {
  console.log(`MemoizedMarkdown render: id=${id}, contentLength=${content.length}`);
  const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

  return blocks.map((block, index) => (
    <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
  ));
},
  );

MemoizedMarkdown.displayName = 'MemoizedMarkdown';