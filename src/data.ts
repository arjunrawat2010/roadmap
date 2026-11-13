export type ResType = 'Course' | 'Docs' | 'Article' | 'Video' | 'Book';
/** [title, url (no scheme), what you get, time, type] */
export type Resource = [string, string, string, string, ResType];

export interface Stage {
  n: number;
  title: string;
  project: string;
  goal: string;
  desc: string;
  learn: string[];
  res: Resource[];
  step: string[];
  stepDetail?: string[];
  imp: string[];
  done: string[];
}

/** Sections that count toward progress. "imp" (Improve it) is optional and never counted. */
export const SECS = ['learn', 'res', 'step', 'done'] as const;
export type Sec = (typeof SECS)[number];

export const STAGES: Stage[] = [
  {
    n: 1, title: 'Python and LLM API foundations', project: 'Ticket Triage API',
    goal: 'Write a Python API service that calls both a cloud model and a local model and gets reliable structured output from each.',
    desc: 'A FastAPI service that turns a raw support ticket into validated, structured triage data — from either Claude or a local model.',
    learn: ['Python fluency (types, async/await, venvs, uv/pip)', 'FastAPI and Pydantic', 'How LLMs work (tokens, context windows, temperature, hallucination)', 'Calling an LLM API (messages, system prompts, streaming, tool calling, structured JSON)', 'Prompting basics', 'Running an open model locally'],
    res: [
      ['Python official tutorial', 'docs.python.org/3/tutorial', 'Core syntax, types, modules and virtual environments', '8–10 h', 'Docs'],
      ['FastAPI Tutorial – User Guide', 'fastapi.tiangolo.com/tutorial', 'Routing, Pydantic models and async endpoints', '6–8 h', 'Docs'],
      ['Karpathy: Intro to Large Language Models', 'youtube.com', 'A mental model of tokens, training and failure modes', '1 h', 'Video'],
      ['Anthropic courses (GitHub)', 'github.com/anthropics/courses', 'Prompting, tool use and structured output notebooks', '8–10 h', 'Course'],
      ['Anthropic Academy: Building with the Claude API', 'anthropic.skilljar.com/claude-with-the-anthropic-api', 'Messages, streaming and tool calling end to end', '6–8 h', 'Course'],
      ['Ollama', 'ollama.com', 'Run open models locally behind an HTTP API', '1–2 h', 'Docs'],
    ],
    step: ['POST /triage returns Pydantic-validated JSON (category, priority P1–P4, affected_service, one_line_summary)', 'Use structured output; retry if validation fails', 'Two backends (Claude API + local Ollama) behind one interface', 'POST /triage/stream streams the response', 'Write 30 sample tickets with expected answers'],
    imp: ['Compare both backends on accuracy, latency and cost per 1,000 tickets', 'Retries, timeouts, cache', 'One-page Angular UI', 'Dockerfile + docker-compose'],
    done: ['Runs with docker compose up', 'Both backends return schema-valid JSON on all 30 tickets', 'README has the comparison table', 'Can explain when to pick local vs cloud'],
  },
  {
    n: 2, title: 'RAG done properly', project: 'Runbook Copilot',
    goal: 'Build a Q&A system over company documents and prove its retrieval quality with numbers.',
    desc: 'Q&A over runbooks, KB articles and post-mortems that cites its sources, refuses when it can’t answer, and is measured by an eval set.',
    learn: ['Embeddings and vector similarity', 'Chunking strategies', 'Hybrid search (BM25 + vector) and reranking', 'Contextual retrieval', 'Grounded answers with citations and refusals', 'Evals (test set, hit rate, faithfulness, LLM-as-judge)'],
    res: [
      ['DeepLearning.AI: Retrieval Augmented Generation', 'learn.deeplearning.ai/courses/retrieval-augmented-generation', 'Retrieval, chunking and evaluation in one course', '10–15 h', 'Course'],
      ['Anthropic: Introducing Contextual Retrieval', 'anthropic.com/news/contextual-retrieval', 'The chunk-context technique and its reranking results', '1 h', 'Article'],
      ['pgvector (GitHub)', 'github.com/pgvector/pgvector', 'Vector columns, indexes and distance operators in Postgres', '2–3 h', 'Docs'],
      ['Qdrant documentation', 'qdrant.tech/documentation', 'A dedicated vector DB with filtering and hybrid search', '2–3 h', 'Docs'],
      ['Hamel Husain: Your AI Product Needs Evals', 'hamel.dev/blog/posts/evals', 'How to build an eval loop that drives decisions', '1–2 h', 'Article'],
    ],
    step: ['Collect 50–200 runbooks/KB articles/post-mortems', 'Ingestion pipeline (split by heading, embed, store in pgvector with metadata)', 'POST /ask with cited answers', 'Reply “not found” when the runbooks don’t cover it', '50-question eval set', 'Eval script for hit rate + answer score'],
    imp: ['Compare 3 chunking strategies', 'Add BM25 hybrid search', 'Reranker + contextual retrieval', 'pgvector vs Qdrant', 'Run evals in CI'],
    done: ['Answers cite sources and refuse when the answer is missing', 'Eval runs with one command', 'Before/after table in README', 'Can explain the final choices'],
  },
  {
    n: 3, title: 'Agents, tool calling and MCP', project: 'CMDB MCP server + Ops Agent',
    goal: 'Build an agent that safely acts on real systems, and expose internal systems to AI clients through MCP.',
    desc: 'Expose a CMDB through MCP, then build an agent that investigates incidents and proposes actions — with human approval for anything that writes.',
    learn: ['Workflows vs agents', 'Agent patterns (routing, chaining, orchestrator-workers, evaluator-optimizer)', 'Tool design', 'MCP (servers, clients, tools, resources, prompts, stdio/HTTP)', 'Human-in-the-loop', 'LangGraph state and memory', 'Tracing and evaluating agents'],
    res: [
      ['Anthropic: Building effective agents', 'anthropic.com/engineering/building-effective-agents', 'Workflow vs agent patterns and when to use each', '1–2 h', 'Article'],
      ['Anthropic: Writing tools for agents', 'anthropic.com/engineering/writing-tools-for-agents', 'Tool naming, schemas and error design', '1 h', 'Article'],
      ['MCP: Build a server', 'modelcontextprotocol.io/docs/develop/build-server', 'Your first MCP server with tools and resources', '2–3 h', 'Docs'],
      ['Hugging Face AI Agents Course', 'huggingface.co/learn/agents-course', 'Agent fundamentals, plus a certificate', '20–30 h', 'Course'],
      ['LangChain Academy: Introduction to LangGraph', 'academy.langchain.com/courses/intro-to-langgraph', 'State, memory and human-in-the-loop graphs', '5–6 h', 'Course'],
    ],
    step: ['Small CMDB in Postgres (services, servers, DBs, dependencies, incidents)', 'MCP server with get_ci, get_dependencies, search_incidents, create_ticket', 'Connect it to an MCP client', 'Ops Agent loop (look up item → walk dependencies → find similar incidents → ask Runbook Copilot → propose action)', 'Human approval for write actions', 'Log every step'],
    imp: ['Plain API vs LangGraph version', '20 test incidents scored', 'Guardrails (max steps, token budget, read-only default)', 'HTTP transport + auth'],
    done: ['Works from an off-the-shelf MCP client', 'Right root cause on most test incidents', 'No write action without approval', 'Readable trace for every run'],
  },
  {
    n: 4, title: 'The platform layer', project: 'AI Platform in a Box',
    goal: 'Run a self-hosted AI platform on Kubernetes with one gateway for all models, tracing, cost tracking and guardrails.',
    desc: 'A one-install Kubernetes platform: open models on vLLM, one LiteLLM gateway with team budgets, Langfuse tracing and guardrails.',
    learn: ['Kubernetes essentials and Helm', 'GPU scheduling and model sizing', 'Serving open models with vLLM', 'LLM gateways', 'LLM observability', 'AI security (OWASP LLM Top 10)'],
    res: [
      ['Kubernetes: Learn Kubernetes Basics', 'kubernetes.io/docs/tutorials/kubernetes-basics', 'Pods, deployments and services, hands-on', '4–6 h', 'Docs'],
      ['vLLM documentation', 'docs.vllm.ai', 'Serving open models with high throughput', '3–4 h', 'Docs'],
      ['LiteLLM AI Gateway', 'docs.litellm.ai/docs/simple_proxy', 'Proxy, virtual keys, budgets and fallbacks', '3–4 h', 'Docs'],
      ['Langfuse self-hosting', 'langfuse.com/self-hosting', 'Tracing plus cost and latency dashboards', '3–4 h', 'Docs'],
      ['OWASP Top 10 for LLM Applications', 'genai.owasp.org', 'The threat list for LLM apps, incl. prompt injection', '2–3 h', 'Article'],
    ],
    step: ['Local K8s cluster (k3s/kind/minikube) and Helm charts', 'Deploy vLLM with a small open model', 'LiteLLM gateway routing to vLLM + Claude API with fallback', 'A virtual key per team with budgets and rate limits', 'Point all earlier projects at the gateway', 'Langfuse dashboard of cost/latency per team', 'PII masking + prompt-injection blocking'],
    imp: ['Load test + quantised model', 'Cost model (self-hosted vs API at 1k/10k/100k requests a day)', 'Red-team with 10 injection attempts', 'Budget and error alerts'],
    done: ['One install brings up the platform', 'All projects call models through the gateway', 'Langfuse shows cost/latency per team', 'Cost model and red-team results written up'],
  },
  {
    n: 5, title: 'Capstone – AI Incident Assistant', project: 'AI Incident Assistant',
    goal: 'Join all earlier projects into one end-to-end system.',
    desc: '', learn: [], res: [],
    step: ['Orchestration', 'Angular console', 'Evals and feedback', 'Hardening'],
    stepDetail: ['Wire the ITSM webhook, agent loop and calls to Triage API, Runbook Copilot and the CMDB MCP server.', 'Incident list, streaming reasoning, dependency tree, cited runbooks, Approve/Edit/Reject.', '30 test incidents; store decisions as labelled data.', 'Timeouts, fallbacks, role-based access, audit log, 5-minute demo video.'],
    imp: ['Confidence score and routing', 'Weekly impact report', 'Small-vs-large model routing', 'Auto-drafted post-incident reviews'],
    done: ['Ticket flows end to end to an approved proposal', 'Eval score tracked', 'Audit log complete', 'Demo video recorded'],
  },
  {
    n: 6, title: 'Make it visible', project: 'Architecture pack + internal proposal',
    goal: 'Document the work well enough for leadership approval and outside review.',
    desc: 'ADRs, an architecture doc and a leadership proposal that make the work reviewable — and fundable.',
    learn: ['Architecture Decision Records', 'Writing for executives', 'Phased rollout planning'],
    res: [['ADR GitHub organisation', 'adr.github.io', 'Templates and practice for decision records', '1–2 h', 'Docs']],
    step: ['6–10 ADRs', '4–6 page architecture doc', '10-slide leadership proposal with demo and phased rollout', 'Live team demo', 'Public GitHub repo with README', 'One LinkedIn/blog article'],
    imp: [],
    done: ['ADRs + architecture doc in repo', 'Proposal presented to a decision-maker', 'Public repo live', 'One article published'],
  },
];

export const START_DATE = new Date(2026, 8, 22); // 22 Sep 2026
export const MONTHS = ['22 Sep – 21 Oct 2026', '22 Oct – 21 Nov 2026', '22 Nov – 21 Dec 2026', '22 Dec 2026 – 21 Jan 2027', '22 Jan – 21 Feb 2027', '22 Feb – 21 Mar 2027'];
export const MSHORT = ['Sep–Oct 2026', 'Oct–Nov 2026', 'Nov–Dec 2026', 'Dec–Jan 2027', 'Jan–Feb 2027', 'Feb–Mar 2027'];

export const TYPE_DOT: Record<ResType, string> = { Course: '#8362C5', Docs: '#2680EA', Article: '#459A9C', Video: '#C76B73', Book: '#D88C2A' };

export type StatusKey = 'ns' | 'ip' | 'done';
export const STAT: Record<StatusKey, { l: string; bg: string; fg: string; dot: string }> = {
  ns: { l: 'Not started', bg: 'var(--nsbg)', fg: 'var(--nsfg)', dot: 'var(--nsdot)' },
  ip: { l: 'In progress', bg: 'var(--ipbg)', fg: 'var(--ipfg)', dot: 'var(--ipdot)' },
  done: { l: 'Done', bg: 'var(--okbg)', fg: 'var(--okfg)', dot: 'var(--okdot)' },
};

export const HABITS: [string, string][] = [
  ['Read one engineering post and write 3 lines on it', ''],
  ['Update the tracker', ''],
  ['Answer the three questions for this week’s work', 'Cost per 1,000 requests? What happens when it fails? How do I know it works?'],
];

export const CERTS: { name: string; when: string; optional: boolean }[] = [
  { name: 'CKA – Certified Kubernetes Administrator', when: 'AFTER STAGE 4', optional: false },
  { name: 'Hugging Face Agents Course certificate', when: 'DURING STAGE 3', optional: false },
  { name: 'Cloud AI certification', when: 'AFTER STAGE 6', optional: true },
];

export const BLOGS: [string, string][] = [
  ['Anthropic Engineering', 'anthropic.com/engineering'],
  ['Hamel Husain', 'hamel.dev'],
  ['Simon Willison', 'simonwillison.net'],
];

export const CAP_SERVICES = [
  { name: 'Triage API', sub: 'Classify + prioritise', tag: 'Stage 1' },
  { name: 'Runbook Copilot', sub: 'Cited runbook answers', tag: 'Stage 2' },
  { name: 'CMDB MCP server', sub: 'CIs · dependencies · incidents', tag: 'Stage 3' },
];

/** Profile shown in the header. Sample values from the design; change them here. */
export const PROFILE = { initials: 'AM', name: 'Alex Morgan' };
