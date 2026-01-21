import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { transformKantraReport } from './src/utils/kantraTransformer.js';

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

// Load kantra report from directory
app.post('/api/load-kantra', async (req, res) => {
  try {
    const { directoryPath } = req.body;

    if (!directoryPath) {
      return res.status(400).json({ error: 'Directory path is required' });
    }

    // Security: Validate path to prevent directory traversal attacks
    const normalizedPath = path.normalize(directoryPath);
    if (normalizedPath.includes('..')) {
      return res.status(400).json({ error: 'Invalid directory path: path traversal not allowed' });
    }

    // Check if directory exists
    if (!fs.existsSync(normalizedPath)) {
      return res.status(404).json({ error: `Directory not found: ${directoryPath}` });
    }

    // Check if it's a directory
    const stats = fs.statSync(normalizedPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: `Path is not a directory: ${directoryPath}` });
    }

    // Look for output.yaml or output.yml
    const outputYamlPath = path.join(normalizedPath, 'output.yaml');
    const outputYmlPath = path.join(normalizedPath, 'output.yml');

    let yamlPath;
    if (fs.existsSync(outputYamlPath)) {
      yamlPath = outputYamlPath;
    } else if (fs.existsSync(outputYmlPath)) {
      yamlPath = outputYmlPath;
    } else {
      return res.status(404).json({
        error: 'output.yaml not found in directory',
        hint: 'Make sure this is a valid kantra output directory containing output.yaml'
      });
    }

    // Check file size (limit to 50MB to prevent memory issues)
    const fileStats = fs.statSync(yamlPath);
    const fileSizeMB = fileStats.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      return res.status(413).json({
        error: `File too large: ${fileSizeMB.toFixed(1)}MB (max 50MB)`,
        hint: 'Try analyzing a smaller portion of your codebase'
      });
    }

    console.log(`Loading kantra report from: ${yamlPath} (${fileSizeMB.toFixed(1)}MB)`);

    // Read and parse the YAML file
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');

    // Extract application name from directory name
    const applicationName = path.basename(normalizedPath) || 'Konveyor Analysis';

    // Transform to visualization format
    const transformedData = transformKantraReport(yamlContent, {
      applicationName: `${applicationName} (Konveyor Analysis)`,
      analysisDate: new Date().toISOString().split('T')[0]
    });

    console.log(`Successfully loaded report: ${transformedData.summary.totalComponents} components, ${transformedData.summary.totalIssues} issues`);

    res.json(transformedData);
  } catch (error) {
    console.error('Error loading kantra report:', error);

    // Provide more helpful error messages
    if (error.message.includes('Failed to parse YAML')) {
      return res.status(400).json({
        error: 'Invalid YAML format',
        details: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to load kantra report',
      details: error.message
    });
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
    issueTypes: [...new Set(c.issues.map(i => i.type))],
    codeContext: c.codeContext || null
  }));

  const dependencies = [];
  data.components.forEach(comp => {
    if (comp.dependencies) {
      comp.dependencies.forEach(dep => {
        dependencies.push({ from: comp.name, to: dep.target || dep });
      });
    }
  });

  // Determine analysis tier based on available data
  const hasFullSource = componentDetails.some(c =>
    c.codeContext && c.codeContext.fullSource && c.codeContext.fullSource.length > 0
  );
  const hasCodeSnippets = componentDetails.some(c =>
    c.codeContext && c.codeContext.stats.totalSnippets > 0
  );

  let analysisTier;
  if (hasFullSource) {
    analysisTier = 'Tier 3: Full Source';
  } else if (hasCodeSnippets) {
    analysisTier = 'Tier 2: Code Snippets';
  } else {
    analysisTier = 'Tier 1: Structure Only';
  }

  // Build code context section based on tier
  let codeContextSection = '';

  if (hasFullSource) {
    // TIER 3: Full Source Code Available
    codeContextSection = `\n\nCODE CONTEXT (Tier 3 - FULL SOURCE ANALYSIS):
${componentDetails.map(c => {
  if (!c.codeContext || !c.codeContext.fullSource || c.codeContext.fullSource.length === 0) return '';

  return `
${c.name}:
  Full Source Files: ${c.codeContext.stats.totalSourceFiles}
  Total Source Lines: ${c.codeContext.stats.totalSourceLines}
  Classes: ${c.codeContext.allClassNames.join(', ') || 'none identified'}

  COMPLETE SOURCE CODE (${c.codeContext.fullSource.length} files):
${c.codeContext.fullSource.slice(0, 5).map((src) => `
    ========================================
    FILE: ${src.file} (${src.lines} lines)
    ========================================
${src.source.split('\n').slice(0, 100).map(line => `    ${line}`).join('\n')}
    ${src.lines > 100 ? `    ...(${src.lines - 100} more lines)` : ''}
`).join('\n')}
  ${c.codeContext.fullSource.length > 5 ? `  ...and ${c.codeContext.fullSource.length - 5} more files` : ''}
  `;
}).filter(Boolean).join('\n')}

ANALYSIS TIER: ${analysisTier}
You have COMPLETE SOURCE CODE access. Use this to:
- Extract EXACT business logic, rules, and calculations from method implementations
- Identify ALL business entities with complete field definitions and relationships
- Understand FULL workflows and process flows from complete method bodies
- Map database schemas from complete JPA/Hibernate entity definitions
- Extract API contracts from complete REST controller implementations
- Identify business validations and constraints from actual code
- Discover domain events and messaging patterns from full implementation
- THIS IS PRODUCTION-QUALITY EXTRACTION - You can provide precise, actionable specifications
`;
  } else if (hasCodeSnippets) {
    // TIER 2: Code Snippets Available
    codeContextSection = `\n\nCODE CONTEXT (Tier 2 - Code Snippets):
${componentDetails.map(c => {
  if (!c.codeContext || c.codeContext.stats.totalSnippets === 0) return '';

  return `
${c.name}:
  Files: ${c.codeContext.stats.totalFiles}
  Classes: ${c.codeContext.allClassNames.join(', ') || 'none identified'}
  Key Imports: ${c.codeContext.allImports.slice(0, 10).join(', ')}${c.codeContext.allImports.length > 10 ? ` (${c.codeContext.allImports.length - 10} more...)` : ''}

  Sample Code Snippets (${c.codeContext.snippets.length} total):
${c.codeContext.snippets.slice(0, 3).map((s) => `
    [${s.file}]
${s.snippet.split('\n').slice(0, 15).map(line => `    ${line}`).join('\n')}
    ${s.snippet.split('\n').length > 15 ? '    ...(truncated)' : ''}
`).join('\n')}
  `;
}).filter(Boolean).join('\n')}

ANALYSIS TIER: ${analysisTier}
You have access to code snippets showing imports, class definitions, and method signatures. Use this to:
- Infer business logic from method names and class structures
- Identify domain entities from class names and imports
- Understand service responsibilities from code organization
- Map database/persistence patterns from imports (JPA, Hibernate, etc.)
- Detect API patterns from REST/JAX-RS annotations in imports
- Note: Limited context - infer where needed, recommend GitHub URL for Tier 3 full source
`;
  }

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
${codeContextSection}

Using Domain-Driven Design principles, proven microservices patterns, and Kubernetes best practices, provide a comprehensive decomposition strategy:

1. EXTRACT BUSINESS LOGIC FROM LEGACY CODE (Critical for teams with zero domain knowledge)
   ${hasFullSource ? `
   - USE COMPLETE SOURCE CODE ABOVE: You have full method implementations
   - Extract EXACT business operations from method bodies (e.g., calculateDiscount logic, order validation rules)
   - Identify ALL business entities with complete field definitions and annotations
   - Extract PRECISE business rules from if/switch statements and validation code
   - Map complete database schemas from JPA entity definitions
   - Identify workflows from complete service method implementations
   - Extract API contracts from complete REST controller method signatures and request/response objects
   - Document business calculations and formulas from actual implementation code
   - THIS IS SUFFICIENT FOR PRODUCTION IMPLEMENTATION - Be precise and thorough
   ` : hasCodeSnippets ? `
   - USE CODE SNIPPETS ABOVE: Analyze actual class names, method signatures, and imports
   - Identify business operations from method names in code (e.g., calculateDiscount, validateOrder)
   - Extract business entities from class definitions (e.g., Order, Customer, Invoice)
   - Infer business rules from validation patterns in code snippets
   - Map database entities from JPA/Hibernate annotations in imports
   - Identify service responsibilities from class structure and dependencies
   - Note: Limited to visible snippets - some inference required
   ` : `
   - Analyze component/class names to infer business capabilities (limited context)
   - Identify business operations from file names and patterns
   - Extract business entities from model/persistence component structures
   - Document business workflows from component dependencies
   - Note: Significant inference required - recommend configuring GitHub URL for better results
   `}
   - Map source components to business domains

2. IDENTIFY BOUNDED CONTEXTS
   - Analyze component relationships and identify natural service boundaries
   - Consider business capabilities and domain models
   - Group related components into logical microservices
   - Apply Single Responsibility Principle at service level

3. PROPOSE MICROSERVICES (4-7 services) - APPLY PATTERNS IN DESIGN
   - Name each microservice clearly (e.g., "User Management Service", "Product Catalog Service")
   - Assign a type (api, worker, gateway, data-service)
   - List which components belong to each microservice
   - Define 3-5 key responsibilities for each service
   - Specify which architecture patterns this service implements (e.g., "Uses Circuit Breaker for resilience", "Implements Saga for transactions")
   - Include specific pattern application (e.g., "API Gateway routes to this service", "Publishes events via Outbox pattern")
   - Ensure services are loosely coupled and highly cohesive

4. MIGRATION STRATEGY (3-5 phases using proven patterns)
   - STRANGLER FIG PATTERN: Incrementally replace monolith functionality
   - Start with stateless, leaf services (lowest risk)
   - Use ANTI-CORRUPTION LAYER to interface with monolith during transition
   - Progress to core business logic
   - Consider data migration complexity
   - Each phase should include specific services to migrate and rollback strategy

5. ARCHITECTURE PATTERNS (specify which patterns to use)
   - API GATEWAY: Single entry point, routing, authentication, rate limiting
   - BACKEND FOR FRONTEND (BFF): UI-specific APIs if needed
   - SERVICE MESH: For service-to-service communication (Istio/Linkerd)
   - CIRCUIT BREAKER: Prevent cascading failures (resilience4j, Hystrix)
   - SAGA PATTERN: Distributed transaction management (choreography vs orchestration)
   - EVENT SOURCING & CQRS: If complex domain or audit requirements
   - OUTBOX PATTERN: Reliable event publishing from database transactions

6. DATA MANAGEMENT STRATEGY
   - DATABASE PER SERVICE pattern for true service autonomy
   - SHARED DATABASE during migration with database views for logical separation
   - CHANGE DATA CAPTURE (CDC) with Debezium for data synchronization
   - EVENT-DRIVEN ARCHITECTURE with Apache Kafka/RabbitMQ
   - SAGA PATTERN for distributed transactions (specify choreography or orchestration)
   - Dual-write pattern during migration, then cutover
   - CQRS for read-heavy services with separate read models

7. KUBERNETES RECOMMENDATIONS (3-5 items)
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
  "businessLogic": [
    {
      "domain": "Business Domain Name",
      "description": "What this domain does",
      "operations": ["Operation1", "Operation2"],
      "entities": ["Entity1", "Entity2"],
      "rules": ["Business rule or validation"],
      "sourceComponents": ["component1", "component2"],
      "targetService": "Target Microservice Name",
      "complexity": "Low|Medium|High",
      "criticalLogic": "Key business logic that must be preserved"
    }
  ],
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
      let jsonStr = jsonMatch[0];

      // Fix common JSON issues
      // Remove trailing commas before closing brackets/braces
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      // Remove comments
      jsonStr = jsonStr.replace(/\/\/.*$/gm, '');
      jsonStr = jsonStr.replace(/\/\*[\s\S]*?\*\//g, '');

      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);

      // Log context around the error position if available
      const errorMatch = parseError.message.match(/position (\d+)/);
      if (errorMatch) {
        const pos = parseInt(errorMatch[1]);
        const start = Math.max(0, pos - 200);
        const end = Math.min(jsonMatch[0].length, pos + 200);
        console.error('Context around error:');
        console.error(jsonMatch[0].substring(start, end));
        console.error(' '.repeat(Math.min(pos - start, 200)) + '^');
      } else {
        console.error('Raw content sample:', jsonMatch[0].substring(0, 500));
      }

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
