"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h1: (props) => <h2 className="font-display text-xl text-lit-gold mt-6 mb-2" {...props} />,
  h2: (props) => <h3 className="font-display text-lg text-lit-gold mt-5 mb-2" {...props} />,
  h3: (props) => <h4 className="font-display text-base text-lit-gold mt-4 mb-2" {...props} />,
  p: (props) => <p className="leading-relaxed mb-3" {...props} />,
  strong: (props) => <strong className="text-white font-semibold" {...props} />,
  em: (props) => <em className="text-lit-gold italic" {...props} />,
  ul: (props) => <ul className="list-disc ml-6 space-y-1 mb-3" {...props} />,
  ol: (props) => <ol className="list-decimal ml-6 space-y-1 mb-3" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-2 border-lit-gold pl-4 italic text-lit-text-secondary my-3"
      {...props}
    />
  ),
  img: (props) => (
    <img className="rounded-lg my-4 max-w-full" alt={props.alt ?? ""} {...props} />
  ),
  table: (props) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-stone-800 text-lit-gold" {...props} />,
  th: (props) => (
    <th className="border border-stone-700 px-3 py-2 text-left font-display" {...props} />
  ),
  td: (props) => <td className="border border-stone-700 px-3 py-2" {...props} />,
  code: (props) => (
    <code className="bg-stone-800 text-lit-gold px-1.5 py-0.5 rounded text-sm" {...props} />
  ),
};

export default function MarkdownBody({ body }: { body: string }) {
  if (!body) return null;
  return (
    <div className="text-lit-text">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </ReactMarkdown>
    </div>
  );
}
