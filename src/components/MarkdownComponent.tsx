import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import { CodeBlock } from './codeCopyBtn';

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

function MarkdownComponent({ markdown }: { markdown: string }) {
  return (
    <div className="dark:text-gray-100 text-gray-900 dark:prose-invert overflow-auto">
      <ReactMarkdown
        className="markdown"
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: CodeProps) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <CodeBlock
                language={match[1]}
              >
                {String(children).replace(/\n$/, '')}
              </CodeBlock>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownComponent