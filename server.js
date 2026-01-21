import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', provider: getActiveProvider() });
});

// Get active LLM provider
function getActiveProvider() {
  if (process.env.VITE_ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.VITE_OPENAI_API_KEY) return 'openai';
  if (process.env.VITE_OLLAMA_BASE_URL) return 'ollama';
  return 'none';
}

// Generate AI insights
app.post('/api/insights', async (req, res) => {
  try {
    const { analysisData } = req.body;
    const provider = getActiveProvider();

    if (provider === 'none') {
      return res.status(400).json({ error: 'No LLM provider configured' });
    }

    let result;
    switch (provider) {
      case 'anthropic':
        result = await callAnthropic(analysisData);
        break;
      case 'openai':
        result = await callOpenAI(analysisData);
        break;
      case 'ollama':
        result = await callOllama(analysisData);
        break;
      default:
        return res.status(400).json({ error: 'Invalid provider' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate microservices decomposition
app.post('/api/decomposition', async (req, res) => {
  try {
    const { analysisData } = req.body;
    const provider = getActiveProvider();

    if (provider === 'none') {
      return res.status(400).json({ error: 'No LLM provider configured' });
    }

    let result;
    switch (provider) {
      case 'anthropic':
        result = await callAnthropicDecomposition(analysisData);
        break;
      case 'openai':
        result = await callOpenAIDecomposition(analysisData);
        break;
      case 'ollama':
        result = await callOllamaDecomposition(analysisData);
        break;
      default:
        return res.status(400).json({ error: 'Invalid provider' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error generating decomposition:', error);
    res.status(500).json({ error: error.message });
  }
});

// Build prompt for insights
function buildPrompt(data) {
  const componentSummaries = data.components.map(c => ({
    name: c.name,
    type: c.type,
    issues: c.issues.length,
    criticalIssues: c.issues.filter(i => i.severity === 'critical').length,
    topIssueTypes: [...new Set(c.issues.slice(0, 5).map(i => i.type))]
  }));

  const issueTypes = {};
  data.components.forEach(c => {
    c.issues.forEach(issue => {
      if (!issueTypes[issue.type]) {
        issueTypes[issue.type] = [];
      }
      issueTypes[issue.type].push({
        component: c.name,
        severity: issue.severity
      });
    });
  });

  return `You are an expert application modernization consultant analyzing a Konveyor static analysis report for migration planning.

APPLICATION: ${data.applicationName}
TOTAL COMPONENTS: ${data.summary.totalComponents}
TOTAL ISSUES: ${data.summary.totalIssues}

COMPONENTS:
${componentSummaries.map(c =>
  `- ${c.name} (${c.type}): ${c.issues} issues (${c.criticalIssues} critical)
    Common issue types: ${c.topIssueTypes.join(', ')}`
).join('\n')}

ISSUE PATTERNS:
${Object.entries(issueTypes).slice(0, 5).map(([type, issues]) =>
  `- ${type}: ${issues.length} occurrences across ${new Set(issues.map(i => i.component)).size} components`
).join('\n')}

Please analyze this Konveyor report and provide actionable insights in the following categories:

1. PRIORITY RECOMMENDATIONS (2-3 items)
   - Which components should be addressed first and why
   - Consider issue count, severity, and architectural impact

2. RISK ASSESSMENT (1-2 items)
   - Critical blockers or high-risk areas
   - Technology EOL or security concerns

3. MIGRATION STRATEGY (2-3 phases)
   - Suggested order of migration
   - Quick wins vs foundational work

4. PATTERN INSIGHTS (1-2 items)
   - Common issue patterns that can be addressed systematically
   - Opportunities for bulk fixes or automation

Return your response as JSON in this exact format:
{
  "priority": [{"title": "...", "description": "...", "type": "critical"}],
  "risks": [{"title": "...", "description": "...", "type": "critical"}],
  "roadmap": [{"phase": 1, "title": "...", "description": "..."}],
  "patterns": [{"title": "...", "description": "...", "type": "info"}]
}

Be specific, actionable, and concise. Focus on practical recommendations.`;
}

// Build prompt for microservices decomposition
function buildDecompositionPrompt(data) {
  const componentDetails = data.components.map(c => ({
    name: c.name,
    type: c.type,
    linesOfCode: c.linesOfCode || 0,
    dependencies: c.dependencies || [],
    issues: c.issues.length,
    issueTypes: [...new Set(c.issues.map(i => i.type))]
  }));

  const dependencies = [];
  data.components.forEach(comp => {
    if (comp.dependencies) {
      comp.dependencies.forEach(dep => {
        dependencies.push({ from: comp.name, to: dep.target || dep });
      });
    }
  });

  return `You are an expert cloud-native architect specializing in microservices decomposition and Kubernetes best practices.

Analyze this monolithic application and propose a microservices architecture strategy:

APPLICATION: ${data.applicationName}
COMPONENTS: ${data.summary.totalComponents}
LINES OF CODE: ${data.summary.totalLinesOfCode}

COMPONENT DETAILS:
${componentDetails.map(c =>
  `- ${c.name} (${c.type}): ${c.linesOfCode} LOC, ${c.issues} issues
    Dependencies: ${c.dependencies.length > 0 ? c.dependencies.join(', ') : 'none'}
    Issue types: ${c.issueTypes.join(', ')}`
).join('\n')}

DEPENDENCIES:
${dependencies.map(d => `${d.from} → ${d.to}`).join('\n')}

Using Domain-Driven Design principles, proven microservices patterns, and Kubernetes best practices, provide a comprehensive decomposition strategy:

1. IDENTIFY BOUNDED CONTEXTS
   - Analyze component relationships and identify natural service boundaries
   - Consider business capabilities and domain models
   - Group related components into logical microservices
   - Apply Single Responsibility Principle at service level

2. PROPOSE MICROSERVICES (4-7 services) - APPLY PATTERNS IN DESIGN
   - Name each microservice clearly (e.g., "User Management Service", "Product Catalog Service")
   - Assign a type (api, worker, gateway, data-service)
   - List which components belong to each microservice
   - Define 3-5 key responsibilities for each service
   - Specify which architecture patterns this service implements (e.g., "Uses Circuit Breaker for resilience", "Implements Saga for transactions")
   - Include specific pattern application (e.g., "API Gateway routes to this service", "Publishes events via Outbox pattern")
   - Ensure services are loosely coupled and highly cohesive

3. MIGRATION STRATEGY (3-5 phases using proven patterns)
   - STRANGLER FIG PATTERN: Incrementally replace monolith functionality
   - Start with stateless, leaf services (lowest risk)
   - Use ANTI-CORRUPTION LAYER to interface with monolith during transition
   - Progress to core business logic
   - Consider data migration complexity
   - Each phase should include specific services to migrate and rollback strategy

4. ARCHITECTURE PATTERNS (specify which patterns to use)
   - API GATEWAY: Single entry point, routing, authentication, rate limiting
   - BACKEND FOR FRONTEND (BFF): UI-specific APIs if needed
   - SERVICE MESH: For service-to-service communication (Istio/Linkerd)
   - CIRCUIT BREAKER: Prevent cascading failures (resilience4j, Hystrix)
   - SAGA PATTERN: Distributed transaction management (choreography vs orchestration)
   - EVENT SOURCING & CQRS: If complex domain or audit requirements
   - OUTBOX PATTERN: Reliable event publishing from database transactions

5. DATA MANAGEMENT STRATEGY
   - DATABASE PER SERVICE pattern for true service autonomy
   - SHARED DATABASE during migration with database views for logical separation
   - CHANGE DATA CAPTURE (CDC) with Debezium for data synchronization
   - EVENT-DRIVEN ARCHITECTURE with Apache Kafka/RabbitMQ
   - SAGA PATTERN for distributed transactions (specify choreography or orchestration)
   - Dual-write pattern during migration, then cutover
   - CQRS for read-heavy services with separate read models

6. KUBERNETES RECOMMENDATIONS (3-5 items)
   - Deployment patterns (StatefulSet vs Deployment)
   - Service discovery and networking (ClusterIP, LoadBalancer, Ingress)
   - Configuration management (ConfigMaps, Secrets)
   - Storage (PersistentVolumeClaims for stateful services)
   - Health checks (liveness, readiness, startup probes)
   - Resource limits and Horizontal Pod Autoscaler (HPA)
   - Include specific implementation examples

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations - just pure JSON.

Return your response in this EXACT format:
{
  "overview": "Brief 2-3 sentence summary including which key patterns are used",
  "microservices": [
    {
      "name": "Service Name",
      "description": "What this service does",
      "type": "api",
      "components": ["component1", "component2"],
      "responsibilities": ["resp1", "resp2", "resp3"],
      "patterns": ["Circuit Breaker for resilience", "Outbox pattern for events"],
      "communication": "How it communicates with other services"
    }
  ],
  "migrationStrategy": [
    {
      "phase": 1,
      "title": "Phase name",
      "description": "What happens",
      "services": ["service1"],
      "patterns": ["Strangler Fig"]
    }
  ],
  "kubernetesRecommendations": [
    {
      "title": "Recommendation",
      "description": "Why important",
      "implementation": "How to implement"
    }
  ],
  "dataStrategy": "Description of data management approach"
}

Rules for JSON:
- Use double quotes for all strings
- No trailing commas
- Escape special characters properly
- Keep descriptions concise (under 200 chars each)
- Return pure JSON only, no markdown formatting`;
}

// Call Anthropic API
async function callAnthropic(data) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: buildPrompt(data)
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  const content = result.content[0].text;

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('Failed to parse Anthropic response');
}

// Call OpenAI API
async function callOpenAI(data) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.VITE_OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert application modernization consultant. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: buildPrompt(data)
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}

// Call Ollama API
async function callOllama(data) {
  const baseURL = process.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
  const response = await fetch(`${baseURL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.VITE_OLLAMA_MODEL || 'llama2',
      prompt: buildPrompt(data),
      stream: false,
      format: 'json'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  return JSON.parse(result.response);
}

// Call Anthropic API for decomposition
async function callAnthropicDecomposition(data) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: buildDecompositionPrompt(data)
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  let content = result.content[0].text;

  // Remove markdown code blocks if present
  content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      console.error('Raw content sample:', jsonMatch[0].substring(0, 500));
      throw new Error(`Invalid JSON from AI: ${parseError.message}`);
    }
  }

  throw new Error('Failed to find JSON in Anthropic response');
}

// Call OpenAI API for decomposition
async function callOpenAIDecomposition(data) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.VITE_OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert cloud-native architect specializing in microservices and Kubernetes. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: buildDecompositionPrompt(data)
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}

// Call Ollama API for decomposition
async function callOllamaDecomposition(data) {
  const baseURL = process.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
  const response = await fetch(`${baseURL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.VITE_OLLAMA_MODEL || 'llama2',
      prompt: buildDecompositionPrompt(data),
      stream: false,
      format: 'json'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  return JSON.parse(result.response);
}

app.listen(PORT, () => {
  console.log(`🚀 Konveyor AI Insights Server running on http://localhost:${PORT}`);
  console.log(`📊 Active LLM Provider: ${getActiveProvider()}`);
});
