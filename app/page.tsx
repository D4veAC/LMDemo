'use client';
import { useEffect, useState } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowRight,
  Check,
  ShieldCheck,
  ListFilter,
  ChevronRight,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

type Category = 'High' | 'Medium' | 'Low';
const leads: {
  id: string;
  category: Category;
  confidence: number;
  probabilities: number[];
}[] = [
  {
    id: 'LM-02481',
    category: 'High',
    confidence: 65.34,
    probabilities: [65.34, 28.74, 5.92],
  },
  {
    id: 'LM-02482',
    category: 'High',
    confidence: 62.18,
    probabilities: [62.18, 26.42, 11.4],
  },
  {
    id: 'LM-02483',
    category: 'Medium',
    confidence: 54.76,
    probabilities: [25.1, 20.14, 54.76],
  },
  {
    id: 'LM-02484',
    category: 'Low',
    confidence: 72.4,
    probabilities: [18.3, 72.4, 9.3],
  },
];
function CategoryLabel({ category }: { category: Category }) {
  return (
    <span className={`category ${category.toLowerCase()}`}>
      <span aria-hidden="true">
        {category === 'High' ? '↗' : category === 'Medium' ? '−' : '↓'}
      </span>
      {category}
    </span>
  );
}
function ProbabilityBar({
  category,
  value,
}: {
  category: Category;
  value: number;
}) {
  return (
    <div className={`probability ${category.toLowerCase()}`}>
      <div className="bar-label">
        <span>{category}</span>
        <strong>{value.toFixed(2)}%</strong>
      </div>
      <Progress value={value} aria-label={`${category} probability`} />
    </div>
  );
}
export default function Home() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(leads[0]);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [queued, setQueued] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [queueOnly, setQueueOnly] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem('leadsmapping-workspace-v1') || '{}',
      );
      const valid = (value: unknown): string[] =>
        Array.isArray(value)
          ? [
              ...new Set(
                value.filter(
                  (id): id is string =>
                    typeof id === 'string' && leads.some((l) => l.id === id),
                ),
              ),
            ]
          : [];
      setReviewed(valid(saved.reviewed));
      setQueued(valid(saved.queued));
    } catch {
      setMessage(
        'Saved workspace could not be loaded. You can continue with a fresh queue.',
      );
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        'leadsmapping-workspace-v1',
        JSON.stringify({ reviewed, queued }),
      );
    } catch {
      setMessage(
        'Browser storage is unavailable. Changes will last for this session only.',
      );
    }
  }, [reviewed, queued, loaded]);
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: object,
            options: { signal: AbortSignal },
          ) => unknown;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'list_synthetic_leads',
            description:
              'Read the synthetic prospects and their current review and call queue status.',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true },
            execute: (input: unknown) => {
              if (
                !input ||
                typeof input !== 'object' ||
                Object.keys(input).length
              )
                throw new Error('Expected an empty object.');
              return leads.map((l) => ({
                ...l,
                reviewed: reviewed.includes(l.id),
                queued: queued.includes(l.id),
              }));
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Unsupported experimental registry does not affect the app. */
    }
    return () => lifecycle.abort();
  }, [reviewed, queued]);
  const visible = leads.filter(
    (l) =>
      (!queueOnly || queued.includes(l.id)) &&
      (filter === 'All' || l.category === filter) &&
      l.id.toLowerCase().includes(search.toLowerCase()),
  );
  const isReviewed = reviewed.includes(selected.id);
  return (
    <div className="dashboard">
      <header data-od-id="header" className="header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <ListFilter size={25} />
          </div>
          <div>
            <div className="brand-name">
              LeadsMapping <span className="concept-badge">Conceptual UI</span>
            </div>
            <p>Lead Prioritization Prototype</p>
          </div>
        </div>
        <div className="queue-controls">
          <button
            aria-pressed={queueOnly}
            onClick={() => setQueueOnly(!queueOnly)}
          >
            Call Queue <span>{queued.length}</span>
          </button>
          <span>Saved in this browser</span>
        </div>
      </header>
      <main>
        <div data-od-id="workspace-heading" className="page-heading">
          <div>
            <div className="eyebrow">TELEMARKETING WORKSPACE</div>
            <h1>Lead Queue</h1>
          </div>
          <div className="workflow">
            <span className="workflow-active">01 &nbsp; Select a lead</span>
            <ChevronRight />
            <span>02 &nbsp; Review prediction</span>
            <ChevronRight />
            <span>03 &nbsp; Plan your call</span>
          </div>
        </div>
        <div className="workspace">
          <section
            data-od-id="lead-queue"
            className="queue card"
            aria-labelledby="queue-title"
          >
            <div className="queue-top">
              <div className="section-heading">
                <h2 id="queue-title">
                  {queueOnly ? 'Call Queue' : 'Lead Queue'}{' '}
                  <span className="count">{visible.length}</span>
                </h2>
                <span className="synthetic">Synthetic records</span>
              </div>
              <label className="search">
                <Search size={20} />
                <input
                  aria-label="Search synthetic lead IDs"
                  placeholder="Search lead ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <div
                className="filters"
                aria-label="Filter by predicted category"
              >
                {['All', 'High', 'Medium', 'Low'].map((c) => (
                  <button
                    key={c}
                    aria-pressed={filter === c}
                    onClick={() => setFilter(c)}
                  >
                    {c}
                    <span>
                      {c === 'All'
                        ? leads.length
                        : leads.filter((l) => l.category === c).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <Table className="lead-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Lead ID</TableHead>
                  <TableHead>
                    Predicted
                    <br />
                    Category
                  </TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Review Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((l) => (
                  <TableRow
                    key={l.id}
                    className={selected.id === l.id ? 'selected' : ''}
                  >
                    <TableCell>
                      <button
                        className="lead-link"
                        aria-current={selected.id === l.id ? 'true' : undefined}
                        onClick={() => {
                          setSelected(l);
                          setMessage('');
                        }}
                      >
                        {l.id}
                      </button>
                    </TableCell>
                    <TableCell>
                      <CategoryLabel category={l.category} />
                    </TableCell>
                    <TableCell className="numeric">
                      {l.confidence.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <span className="row-status">
                        {reviewed.includes(l.id)
                          ? queued.includes(l.id)
                            ? 'Reviewed · Queued'
                            : 'Reviewed'
                          : queued.includes(l.id)
                            ? 'Ready · Queued'
                            : 'Ready for Review'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {visible.length === 0 && (
              <p className="empty">
                {queueOnly
                  ? 'No queued leads match. Add a lead from the full queue.'
                  : 'No synthetic leads match your search.'}
              </p>
            )}
            <div className="queue-bottom">
              <span>{visible.length} synthetic leads</span>
              <span>Local demo data</span>
            </div>
            <div data-od-id="model-context" className="model-context">
              <div className="eyebrow">MODEL CONTEXT</div>
              <h3>Keep High-category prospects in reach.</h3>
              <p>
                High recall is the priority. Medium leads remain in the standard
                cold-calling process.
              </p>
              <div className="metrics">
                <div>
                  <strong>High</strong>
                  <span>
                    Recall <b>0.88</b>
                    <i>·</i> Precision <b>0.66</b>
                  </span>
                </div>
                <div>
                  <strong>Medium</strong>
                  <span>
                    Recall <b>0.18</b>
                    <i>·</i> Precision <b>0.99</b>
                  </span>
                </div>
              </div>
            </div>
          </section>
          <section
            data-od-id="lead-detail"
            className="detail card"
            aria-labelledby="lead-title"
          >
            <div className="detail-heading">
              <div>
                <div className="eyebrow">SELECTED PROSPECT · SYNTHETIC</div>
                <h2 id="lead-title">Lead {selected.id}</h2>
              </div>
              <span className="review-status">
                <span aria-hidden="true">{isReviewed ? '✓' : '○'}</span>
                {isReviewed ? 'Reviewed' : 'Ready for Review'}
              </span>
            </div>
            <div
              data-od-id="prediction"
              className={`prediction ${selected.category.toLowerCase()}`}
            >
              <div>
                <div className="prediction-label">PREDICTED CATEGORY</div>
                <h3>
                  <ArrowUpRight aria-hidden="true" />
                  {selected.category} Priority
                </h3>
              </div>
              <div className="confidence">
                <strong>
                  {selected.confidence.toFixed(2)}
                  <span>%</span>
                </strong>
                <span>confidence</span>
              </div>
            </div>
            <div data-od-id="category-probabilities" className="probabilities">
              <div className="section-heading">
                <h3>Category probabilities</h3>
                <span>Total 100%</span>
              </div>
              {(['High', 'Low', 'Medium'] as Category[]).map((c, i) => (
                <ProbabilityBar
                  key={c}
                  category={c}
                  value={selected.probabilities[i]}
                />
              ))}
            </div>
            <div data-od-id="recommended-action" className="recommendation">
              <div className="action-heading">
                <span className="action-icon">
                  <ArrowUpRight size={22} />
                </span>
                <div>
                  <div className="eyebrow">Recommended Action</div>
                  <h3>
                    {selected.category === 'High'
                      ? 'Prioritize for Cold Call'
                      : 'Follow Standard Cold-Calling Process'}
                  </h3>
                </div>
              </div>
              <div className="actions">
                <button
                  className="primary"
                  disabled={!loaded}
                  onClick={() => {
                    const alreadyQueued = queued.includes(selected.id);
                    setQueued((previous) =>
                      alreadyQueued
                        ? previous.filter((id) => id !== selected.id)
                        : [...previous, selected.id],
                    );
                    setMessage(
                      alreadyQueued
                        ? 'Removed from your call queue.'
                        : 'Added to your call queue. No call has been placed.',
                    );
                  }}
                >
                  {queued.includes(selected.id)
                    ? 'Remove from Call Queue'
                    : selected.category === 'High'
                      ? 'Add to Priority Call Queue'
                      : 'Add to Standard Call Queue'}
                  <ArrowRight size={18} />
                </button>
                <button
                  className="secondary"
                  disabled={isReviewed}
                  onClick={() => {
                    setReviewed([...reviewed, selected.id]);
                    setMessage('Marked as reviewed.');
                  }}
                >
                  <Check size={18} />
                  {isReviewed ? 'Reviewed' : 'Mark as Reviewed'}
                </button>
              </div>
            </div>
            <aside data-od-id="responsible-use" className="responsible">
              <ShieldCheck size={22} aria-hidden="true" />
              <p>
                Model predictions support lead prioritization and should be
                reviewed by the telemarketing team before action is taken.
              </p>
            </aside>
          </section>
        </div>
      </main>
      <footer data-od-id="prototype-disclosure">
        <span>
          Conceptual interface — LeadsMapping remains in development. All
          displayed data is synthetic.
        </span>
        <span>PROTOTYPE / 01</span>
      </footer>
      {message && (
        <div className="toast" role="status">
          {message}
          <button onClick={() => setMessage('')} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
