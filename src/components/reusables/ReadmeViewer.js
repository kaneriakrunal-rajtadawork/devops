import { FileText, Loader2, Book } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

// README Viewer Component
const ReadmeViewer = ({ readmeData, isLoadingReadme }) => {
  if (isLoadingReadme) {
    return (
      <div className="flex items-center space-x-2 py-8">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span className="text-sm text-gray-500">Loading README...</span>
      </div>
    );
  }

  if (!readmeData) {
    return (
      <div className="bg-white rounded border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-gray-50 border-gray-200">
          <div className="flex items-center space-x-2">
            <Book className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-700">README</h3>
          </div>
        </div>
        
        {/* Add README prompt */}
        <div className="p-6 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Book className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">
                Add a README
              </h4>
              <p className="text-sm text-gray-600 max-w-md">
                Help people interested in this repository understand your project by adding a README.
              </p>
            </div>
            <button className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded border transition-colors">
              Add a README
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-gray-200 shadow-sm">
      {/* README Header */}
      <div className="px-4 py-3 border-b bg-gray-50 border-gray-200">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-700">README.md</h3>
        </div>
      </div>
      
      {/* README Content */}
      <div className="p-4">
        <ReactMarkdown
          components={{
            // Custom code block renderer with syntax highlighting
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              
              return !inline && language ? (
                <SyntaxHighlighter
                  style={tomorrow}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    margin: '1rem 0',
                    borderRadius: '1rem',
                    borderColor: '#e2e8f0',
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code 
                  className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono" 
                  {...props}
                >
                  {children}
                </code>
              );
            },
            // Custom styling for other elements
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200 text-gray-900">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mb-3 mt-6 pb-2 border-b border-gray-100 text-gray-800">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-800">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-semibold mb-2 mt-3 text-gray-700">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="mb-4 text-gray-700 leading-relaxed">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="ml-4">
                {children}
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-200 pl-4 py-2 mb-4 bg-blue-50 text-gray-700 italic">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-gray-200">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-200 px-4 py-2 text-gray-700">
                {children}
              </td>
            ),
            img: ({ src, alt }) => (
              <img 
                src={src} 
                alt={alt} 
                className="max-w-full h-auto rounded border my-4"
              />
            ),
            hr: () => (
              <hr className="my-6 border-gray-200" />
            )
          }}
        >
          {readmeData}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ReadmeViewer;