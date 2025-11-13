'use client';

import { useState } from 'react';
import { ThinkingIndicator } from '@/components/ai-test/gemini/ThinkingIndicator';
import { AIMessage } from '@/components/ai-test/gemini/AIMessage';
import { mockMessages } from '@/components/ai-test/mock-data';
import { InteractiveToolCall } from '@/components/chat/InteractiveToolCall';
import { MessageActions } from '@/components/chat/MessageActions';
import { ChainOfThought } from '@/components/chat/ChainOfThought';
import { InlineCitation, CitationsList, type Citation } from '@/components/chat/InlineCitation';
import { ThinkingBlock } from '@/components/chat/ThinkingBlock';
import { LiveTokenCounter } from '@/components/chat/LiveTokenCounter';
import { StreamingVisualizer } from '@/components/chat/StreamingVisualizer';
import { ContextWindowMeter, ContextWindowMeterCompact } from '@/components/chat/ContextWindowMeter';
import { ToolExecutionProgress } from '@/components/chat/ToolExecutionProgress';
import { TypewriterMessage, StreamingMessage, WordByWordMessage } from '@/components/chat/TypewriterMessage';
import { MessageDiffViewer, DiffIndicator } from '@/components/chat/MessageDiffViewer';
import { LiveCostTracker } from '@/components/chat/LiveCostTracker';
import { getMessageText, getToolParts } from '@/lib/chat/messages';
import type { ToolUIPart } from 'ai';

const mockThoughtSteps = [
  {
    id: '1',
    title: 'Understanding the request',
    content: 'The user wants to know about weather conditions at KJFK. I should retrieve current METAR and TAF data.',
    status: 'completed' as const,
    timestamp: new Date(Date.now() - 5000),
  },
  {
    id: '2',
    title: 'Selecting appropriate tool',
    content: 'The get_airport_weather tool is the best choice for this request as it provides comprehensive weather data.',
    status: 'completed' as const,
    timestamp: new Date(Date.now() - 4000),
  },
  {
    id: '3',
    title: 'Executing tool call',
    content: 'Calling get_airport_weather with ICAO code KJFK...',
    status: 'active' as const,
    timestamp: new Date(Date.now() - 2000),
  },
  {
    id: '4',
    title: 'Analyzing results',
    content: 'Processing weather data and preparing human-readable summary.',
    status: 'pending' as const,
  },
];

const mockCitations: Citation[] = [
  {
    id: '1',
    title: 'KJFK METAR Report',
    source: 'Aviation Weather Center',
    url: 'https://aviationweather.gov',
    excerpt: 'KJFK 131251Z 27012KT 10SM FEW250 08/M03 A3012',
    relevance: 0.95,
  },
  {
    id: '2',
    title: 'TAF Forecast for KJFK',
    source: 'NOAA Aviation Weather',
    excerpt: 'KJFK 131120Z 1312/1418 27015G25KT P6SM FEW250',
    relevance: 0.88,
  },
];

export default function AITestComponentsPage() {
  const [selectedTab, setSelectedTab] = useState<string>('tool-calls');
  const [liveTokens, setLiveTokens] = useState({ input: 1250, output: 3840 });
  const [isSimulatingStream, setIsSimulatingStream] = useState(false);
  
  // Simulate live token updates
  const simulateTokens = () => {
    const interval = setInterval(() => {
      setLiveTokens(prev => ({
        input: prev.input,
        output: prev.output + Math.floor(Math.random() * 50 + 10)
      }));
    }, 200);
    
    setTimeout(() => clearInterval(interval), 3000);
  };

  // Get a sample tool part from mock messages
  const sampleToolPart = mockMessages
    .flatMap(m => getToolParts(m))
    .find(p => p.state === 'output-available') as ToolUIPart | undefined;

  const tabs = [
    { id: 'tool-calls', name: 'Interactive Tool Calls' },
    { id: 'actions', name: 'Message Actions' },
    { id: 'thinking', name: 'Enhanced Thinking' },
    { id: 'chain', name: 'Chain of Thought' },
    { id: 'citations', name: 'Citations' },
    { id: 'live-metrics', name: 'Live Metrics' },
    { id: 'animations', name: 'Animations' },
    { id: 'gemini', name: 'Gemini' },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-baseline gap-3 mb-1">
            <h1 className="text-lg font-medium text-foreground">AI Chat Components</h1>
            <div className="text-xs text-muted-foreground">
              Practical Enhancements · Production Ready
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Interactive components to enhance your existing chat interface: selectable tool calls, 
            message actions, thinking blocks, chain-of-thought visualization, and inline citations.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="border-t border-border">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-r border-border transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Interactive Tool Calls */}
          {selectedTab === 'tool-calls' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Interactive Tool Calls</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Tool executions with expandable details, copy/export actions, and selection support.
                  Click the checkbox to select, expand for details, or use action buttons.
                </p>
              </div>

              {sampleToolPart && (
                <InteractiveToolCall
                  part={sampleToolPart}
                  selectable
                  onCopy={(data) => console.log('Copied:', data)}
                  onExport={(data) => console.log('Exported:', data)}
                />
              )}

              {mockMessages
                .flatMap(m => getToolParts(m))
                .slice(1, 3)
                .map((part, idx) => (
                  <InteractiveToolCall
                    key={idx}
                    part={part as ToolUIPart}
                    selectable
                  />
                ))}

              <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm">
                <div className="font-medium text-foreground mb-2">Features:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Selectable with checkbox (multi-select support)</li>
                  <li>• Expandable to show input/output JSON</li>
                  <li>• Copy button for quick data extraction</li>
                  <li>• Export to JSON file</li>
                  <li>• Visual status indicators (loading, completed, error)</li>
                  <li>• Selection highlights with ring effect</li>
                </ul>
              </div>
            </div>
          )}

          {/* Message Actions */}
          {selectedTab === 'actions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Message Actions</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Action bars for messages with copy, regenerate, edit, and rating options.
                  Available in both full and compact modes.
                </p>
              </div>

              {/* Full mode example */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <div className="text-sm text-muted-foreground mb-3">Assistant Message</div>
                <div className="text-sm text-foreground mb-4 leading-relaxed">
                  Current conditions at KJFK are excellent for flying. Wind 270° at 12 knots, 
                  visibility 10 statute miles, few clouds at 25,000 feet.
                </div>
                <MessageActions
                  message={mockMessages[1]}
                  onCopy={() => console.log('Copied')}
                  onRegenerate={() => console.log('Regenerate')}
                  onRate={(rating) => console.log('Rated:', rating)}
                />
              </div>

              {/* Compact mode example */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-foreground">
                    User message with compact actions
                  </div>
                  <MessageActions
                    message={mockMessages[0]}
                    compact
                    onCopy={() => console.log('Copied')}
                    onEdit={() => console.log('Edit')}
                  />
                </div>
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm">
                <div className="font-medium text-foreground mb-2">Features:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Copy message content</li>
                  <li>• Regenerate response (assistant only)</li>
                  <li>• Edit message (user only)</li>
                  <li>• Thumbs up/down rating (assistant only)</li>
                  <li>• More options dropdown menu</li>
                  <li>• Compact mode for inline display</li>
                </ul>
              </div>
            </div>
          )}

          {/* Enhanced Thinking Block */}
          {selectedTab === 'thinking' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Enhanced Thinking Block</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Your existing ThinkingBlock component with collapsible content, streaming support,
                  and token/timing metrics.
                </p>
              </div>

              <ThinkingBlock
                content="The user is requesting weather information for John F. Kennedy International Airport (KJFK). I should use the get_airport_weather tool to fetch the current METAR and TAF data. This will provide comprehensive weather information including visibility, wind, temperature, and forecast conditions."
                tokens={145}
                isStreaming={false}
                duration={3}
              />

              <ThinkingBlock
                content="Analyzing flight conditions... determining optimal route..."
                isStreaming={true}
                duration={1}
              />

              <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm">
                <div className="font-medium text-foreground mb-2">Features:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Collapsible with smooth animation</li>
                  <li>• Streaming indicator with pulsing icon</li>
                  <li>• Token count display</li>
                  <li>• Elapsed time tracking</li>
                  <li>• Markdown rendering support</li>
                  <li>• Settings-aware (showThinkingProcess)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Chain of Thought */}
          {selectedTab === 'chain' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Chain of Thought Visualization</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Step-by-step reasoning process with timeline view, expandable steps, and status tracking.
                  Perfect for showing AI reasoning stages.
                </p>
              </div>

              <ChainOfThought steps={mockThoughtSteps} showTimeline />

              <div className="mt-8">
                <h3 className="text-sm font-medium text-foreground mb-3">Alternative: List View</h3>
                <ChainOfThought steps={mockThoughtSteps} showTimeline={false} />
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm">
                <div className="font-medium text-foreground mb-2">Features:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Timeline or list view modes</li>
                  <li>• Step status: pending, active, completed</li>
                  <li>• Expandable step details</li>
                  <li>• Visual progress indicators</li>
                  <li>• Timestamp tracking</li>
                  <li>• Compact summary mode</li>
                </ul>
              </div>
            </div>
          )}

          {/* Citations */}
          {selectedTab === 'citations' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Inline Citations</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Inline source citations with hover previews and expandable source lists.
                  Perfect for RAG implementations.
                </p>
              </div>

              {/* Example message with citations */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <div className="text-sm text-foreground leading-relaxed space-y-2">
                  <p>
                    Current conditions at KJFK show VFR conditions{' '}
                    <InlineCitation citation={mockCitations[0]} index={0} />{' '}
                    with winds from 270° at 12 knots. The terminal forecast{' '}
                    <InlineCitation citation={mockCitations[1]} index={1} />{' '}
                    indicates these conditions will persist through the afternoon.
                  </p>
                  
                  <CitationsList citations={mockCitations} />
                </div>
              </div>

              {/* Compact citations */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <div className="text-sm text-foreground leading-relaxed">
                  Flight conditions are optimal{' '}
                  <InlineCitation citation={mockCitations[0]} index={0} compact />{' '}
                  for departure with clear skies{' '}
                  <InlineCitation citation={mockCitations[1]} index={1} compact />.
                </div>
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm">
                <div className="font-medium text-foreground mb-2">Features:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Inline citations with numbers</li>
                  <li>• Hover preview with source details</li>
                  <li>• Relevance score visualization</li>
                  <li>• External link support</li>
                  <li>• Expandable citations list</li>
                  <li>• Compact mode for dense text</li>
                </ul>
              </div>
            </div>
          )}

          {/* Live Metrics */}
          {selectedTab === 'live-metrics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Live Metrics & Visualizations</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Real-time tracking components with animations, progress bars, and live updates.
                </p>
              </div>

              {/* Live Token Counter */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Live Token Counter</h3>
                <LiveTokenCounter
                  inputTokens={liveTokens.input}
                  outputTokens={liveTokens.output}
                  isStreaming={isSimulatingStream}
                  showBreakdown
                  maxTokens={32768}
                />
                <button
                  onClick={() => {
                    setIsSimulatingStream(true);
                    simulateTokens();
                    setTimeout(() => setIsSimulatingStream(false), 3000);
                  }}
                  className="mt-3 px-4 py-2 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition-colors"
                >
                  Simulate Token Generation
                </button>
              </div>

              {/* Streaming Visualizer */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Streaming Visualizer</h3>
                <StreamingVisualizer
                  isStreaming={isSimulatingStream}
                  chunks={[
                    { timestamp: Date.now() - 5000, content: 'Current', tokens: 45 },
                    { timestamp: Date.now() - 4500, content: ' conditions', tokens: 52 },
                    { timestamp: Date.now() - 4000, content: ' at KJFK', tokens: 38 },
                    { timestamp: Date.now() - 3500, content: ' are excellent', tokens: 61 },
                    { timestamp: Date.now() - 3000, content: ' for flying', tokens: 43 },
                    { timestamp: Date.now() - 2500, content: '. Wind 270°', tokens: 55 },
                    { timestamp: Date.now() - 2000, content: ' at 12 knots', tokens: 48 },
                  ]}
                  currentContent="Current conditions at KJFK are excellent for flying. Wind 270° at 12 knots"
                />
              </div>

              {/* Context Window Meter */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Context Window Meter</h3>
                <div className="grid gap-4">
                  <ContextWindowMeter
                    items={[
                      { type: 'system', tokens: 450, label: 'System prompt' },
                      { type: 'user', tokens: 2340, label: 'User messages' },
                      { type: 'assistant', tokens: 3840, label: 'Assistant responses' },
                      { type: 'tool', tokens: 890, label: 'Tool outputs' },
                    ]}
                    maxTokens={32768}
                    showBreakdown
                  />
                  
                  <div className="border border-border rounded p-3 bg-muted/30">
                    <div className="text-xs font-medium text-foreground mb-2">Compact Version:</div>
                    <ContextWindowMeterCompact used={7520} max={32768} />
                  </div>
                </div>
              </div>

              {/* Tool Execution Progress */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Tool Execution Progress</h3>
                <ToolExecutionProgress
                  toolName="get_airport_weather"
                  steps={[
                    { id: '1', name: 'Validating ICAO code', status: 'completed', duration: 245 },
                    { id: '2', name: 'Fetching METAR data', status: 'completed', duration: 1230 },
                    { id: '3', name: 'Fetching TAF forecast', status: 'running', startTime: Date.now() - 800 },
                    { id: '4', name: 'Parsing weather data', status: 'pending' },
                    { id: '5', name: 'Calculating flight category', status: 'pending' },
                  ]}
                />
              </div>

              {/* Live Cost Tracker */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Live Cost Tracker</h3>
                <LiveCostTracker
                  breakdown={{
                    inputTokens: liveTokens.input,
                    outputTokens: liveTokens.output,
                    cachedTokens: 850,
                    toolCalls: 3,
                  }}
                  model="gemini-2.5-flash"
                  showProjection
                />
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm">
                <div className="font-medium text-foreground mb-2">Features:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Real-time token counting with animations</li>
                  <li>• Live streaming speed and throughput tracking</li>
                  <li>• Circular progress for context window usage</li>
                  <li>• Multi-step tool execution with timers</li>
                  <li>• Cost calculation with projections</li>
                  <li>• Warning alerts at thresholds</li>
                  <li>• All metrics update automatically</li>
                </ul>
              </div>
            </div>
          )}

          {/* Animations */}
          {selectedTab === 'animations' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Animated Components</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Typewriter effects, streaming animations, and diff viewers for message comparisons.
                </p>
              </div>

              {/* Typewriter Effect */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <h3 className="text-sm font-medium text-foreground mb-3">Typewriter Effect</h3>
                <TypewriterMessage
                  content="Current conditions at KJFK are excellent for flying. Wind 270° at 12 knots, visibility 10 statute miles, few clouds at 25,000 feet. Temperature 8°C, dewpoint -3°C."
                  speed={50}
                  showCursor
                />
              </div>

              {/* Word by Word */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <h3 className="text-sm font-medium text-foreground mb-3">Word-by-Word Animation</h3>
                <WordByWordMessage
                  content="Flight Category: VFR. Conditions are clear with good visibility and light winds. Perfect for operations."
                  wordsPerSecond={5}
                />
              </div>

              {/* Streaming Chunks */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <h3 className="text-sm font-medium text-foreground mb-3">Streaming Chunks</h3>
                <StreamingMessage
                  chunks={[
                    'London ',
                    'Heathrow ',
                    '(EGLL) ',
                    'is ',
                    'a ',
                    'major ',
                    'international ',
                    'airport ',
                    'with ',
                    'excellent ',
                    'capabilities. ',
                    'Runways: ',
                    '09L/27R ',
                    '(3,902m), ',
                    '09R/27L ',
                    '(3,660m). ',
                    'Full ',
                    'ILS, ',
                    'VOR, ',
                    'DME ',
                    'available.',
                  ]}
                  delay={100}
                />
              </div>

              {/* Message Diff Viewer - Inline */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Message Diff Viewer (Inline)</h3>
                <MessageDiffViewer
                  original="Current conditions at KJFK are good for flying. Wind 250° at 15 knots, visibility 8 miles."
                  modified="Current conditions at KJFK are excellent for flying. Wind 270° at 12 knots, visibility 10 statute miles, few clouds at 25,000 feet."
                  mode="inline"
                />
              </div>

              {/* Message Diff Viewer - Split */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Message Diff Viewer (Split)</h3>
                <MessageDiffViewer
                  original="You have 2 upcoming flights scheduled for next week."
                  modified="You have 3 upcoming flights scheduled: AAL123 on Nov 14, UAL456 on Nov 16, and DAL789 on Nov 18."
                  mode="split"
                />
              </div>

              {/* Diff Indicator */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <h3 className="text-sm font-medium text-foreground mb-3">Compact Diff Indicator</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Message regenerated:</span>
                  <DiffIndicator
                    original="The weather is acceptable."
                    modified="The weather conditions are excellent with VFR flight category."
                  />
                </div>
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm">
                <div className="font-medium text-foreground mb-2">Features:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Typewriter effect with cursor</li>
                  <li>• Word-by-word animation with fade-in</li>
                  <li>• Chunk-based streaming simulation</li>
                  <li>• Inline and split diff views</li>
                  <li>• Color-coded additions/deletions</li>
                  <li>• Compact diff indicators</li>
                  <li>• Configurable animation speeds</li>
                </ul>
              </div>
            </div>
          )}

          {/* Gemini */}
          {selectedTab === 'gemini' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Gemini Components (Avion)</h2>
                <p className="text-sm text-muted-foreground mb-4">Ceramic/Tungsten base with Avion Orange accents.</p>
              </div>

              <div className="border border-border rounded-lg p-4 bg-card w-fit">
                <ThinkingIndicator />
              </div>

              <div className="border border-border rounded-lg p-4 bg-card">
                <AIMessage
                  isTyping
                  content={
                    'Here’s a concise weather briefing for KJFK. VFR conditions with winds 270° at 12 kt, 10SM visibility, FEW250. Expect similar conditions this afternoon.'
                  }
                  sources={[
                    { title: 'KJFK METAR Report', type: 'database', metadata: 'NOAA · Aviation Weather', url: 'https://aviationweather.gov' },
                    { title: 'TAF Forecast for KJFK', type: 'document', metadata: 'NOAA · 12Z Issuance', url: 'https://aviationweather.gov/taf' },
                  ]}
                />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-6 py-3 bg-card flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>Production-ready components · Fully typed · Accessible</div>
          <div>Ready to integrate with usePremiumChat hook</div>
        </div>
      </div>
    </div>
  );
}
