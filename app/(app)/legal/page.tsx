'use client';

import { useState, useEffect } from 'react';
import { FileText, Scale, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const documents = [
  {
    id: 'terms',
    title: 'Terms of Service',
    icon: FileText,
    description: 'Legal agreement for flight management platform use',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    icon: Shield,
    description: 'Flight operations data privacy (GDPR/CCPA compliant)',
  },
  {
    id: 'liability',
    title: 'Liability Disclaimer',
    icon: AlertTriangle,
    description: 'Flight management tool limitations and disclaimers',
  },
  {
    id: 'aviation',
    title: 'Aviation Disclaimers',
    icon: Scale,
    description: 'FAA, EASA regulatory compliance for operations planning',
  },
];

export default function LegalPage() {
  const [activeDoc, setActiveDoc] = useState('terms');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadDocument() {
      setLoading(true);
      try {
        const response = await fetch(`/api/legal/${activeDoc}`);
        const data = await response.json();
        setContent(data.content || '');
      } catch (error) {
        console.error('Error loading document:', error);
        setContent('# Error\n\nFailed to load document. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    loadDocument();
  }, [activeDoc]);
  
  const currentDoc = documents.find((doc) => doc.id === activeDoc);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-sm bg-zinc-900 flex items-center justify-center">
              <Scale size={18} className="text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Legal & Compliance</h1>
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            Flight management platform legal documentation
          </p>
        </div>
      </div>

      {/* Document Selector Tabs */}
      <div className="border-b border-border bg-card px-8 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 overflow-x-auto">
            {documents.map((doc) => {
              const Icon = doc.icon;
              const isActive = activeDoc === doc.id;
              
              return (
                <button
                  key={doc.id}
                  onClick={() => setActiveDoc(doc.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-sm border transition-all flex-shrink-0
                    ${isActive
                      ? 'bg-[color:color-mix(in_srgb,var(--accent-primary)_12%,transparent)] border-[color:var(--accent-primary)] text-[color:var(--accent-primary)] shadow-sm'
                      : 'bg-surface border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
                    }
                  `}
                  style={
                    isActive
                      ? {
                          boxShadow:
                            'inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.05), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 30%, transparent)',
                        }
                      : {
                          boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.05), inset -1px -1px 3px rgba(255,255,255,0.03)',
                        }
                  }
                >
                  <Icon size={16} strokeWidth={1.5} />
                  <span className="text-xs font-medium whitespace-nowrap">{doc.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Document Header */}
          <div
            className="mb-6 p-6 rounded-sm border border-border bg-surface"
            style={{
              boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-start gap-4">
              {currentDoc && (
                <>
                  <div className="w-12 h-12 rounded-sm bg-zinc-900 flex items-center justify-center flex-shrink-0">
                    <currentDoc.icon size={24} className="text-white" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                      {currentDoc.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{currentDoc.description}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Document Body */}
          <div
            className="prose prose-sm prose-neutral dark:prose-invert max-w-none p-8 rounded-sm border border-border bg-card min-h-[400px]"
            style={{
              boxShadow: '-2px -2px 5px rgba(255,255,255,0.8), 2px 2px 5px rgba(0,0,0,0.05)',
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="text-muted-foreground animate-spin" strokeWidth={1.5} />
              </div>
            ) : (
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-semibold text-foreground mb-4 pb-3 border-b border-border">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-base font-semibold text-foreground mt-4 mb-2">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm text-foreground leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 mb-4 text-sm text-foreground">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-sm text-foreground">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm text-foreground leading-relaxed ml-4">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-foreground">{children}</em>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[color:var(--accent-primary)] hover:underline font-medium"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote
                      className="border-l-4 pl-4 py-2 my-4 italic text-muted-foreground"
                      style={{ borderColor: 'var(--accent-primary)' }}
                    >
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-foreground">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="p-4 rounded-sm bg-muted overflow-x-auto mb-4 border border-border">
                      <code className="text-xs font-mono text-foreground">{children}</code>
                    </pre>
                  ),
                  hr: () => <hr className="my-8 border-border" />,
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full border border-border rounded-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-surface border-b border-border">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => <tbody>{children}</tbody>,
                  tr: ({ children }) => (
                    <tr className="border-b border-border last:border-b-0">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-sm text-foreground">
                      {children}
                    </td>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            )}
          </div>

          {/* Footer Notice */}
          <div className="mt-8 p-6 rounded-sm border border-border bg-surface">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-[color:var(--accent-primary)] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Important Notice
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  These legal documents are provided for transparency and compliance purposes. 
                  By using Avion Flight Management Platform, you agree to these terms. If you have questions about 
                  these documents, please contact{' '}
                  <a
                    href="mailto:hewittjswill@gmail.com"
                    className="text-[color:var(--accent-primary)] hover:underline font-medium"
                  >
                    hewittjswill@gmail.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
