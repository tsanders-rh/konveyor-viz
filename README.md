# Konveyor Visual Analysis Tool

An interactive web-based visualization tool that transforms Konveyor static analysis reports into visual, easy-to-understand representations.

![Konveyor Viz](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3-cyan)

## Overview

This tool addresses the challenge of digesting lengthy Konveyor analysis reports (often 50+ pages) by providing:

- **Interactive Architecture Graph**: Force-directed network visualization showing application components and their dependencies
- **Issue Dashboard**: Visual metrics and breakdowns of issues by type and severity
- **Component Details**: Detailed view of each component with issue lists and technology stack
- **Technology Status**: At-a-glance view of technology stack health (EOL/Outdated/Current)
- **AI-Powered Microservices Decomposition**: Intelligent analysis of monolithic applications with recommendations for breaking them into microservices
- **Business Logic Extraction**: Reverse-engineering of business capabilities from legacy code for teams with zero domain knowledge
- **Spec-Kit Export**: Downloadable specifications for each proposed microservice, ready to use with AI coding agents (Claude Code, Cursor, Copilot, etc.)

## Features

### 1. Application Architecture Graph
- Force-directed network layout showing component relationships
- Color-coded nodes by issue severity:
  - 🔴 Red (Critical): >20 issues
  - 🟡 Yellow (Warning): 5-20 issues
  - 🟢 Green (Good): <5 issues
- Node size proportional to lines of code
- Interactive: Click to view details, zoom/pan to explore

### 2. Issue Dashboard
- Total issues, critical count, warnings, and health score metrics
- Bar chart showing issue breakdown by type
- Visual indicators for problem areas

### 3. Component Detail Panel
- Slides in from right on component click
- Shows issue summary, technology stack, and full issue list
- Each issue includes severity, description, and code location

### 4. Technology Stack Status
- Organized by status: EOL, Outdated, Current
- Visual indicators (🔴 🟡 🟢) for quick assessment
- Shows which components use each technology

### 5. AI-Powered Microservices Decomposition
- **Intelligent Service Boundaries**: AI analyzes component relationships to identify natural bounded contexts
- **Business Logic Discovery**: Extracts business capabilities from legacy code (operations, entities, rules, workflows)
- **Architecture Patterns**: Recommends proven patterns (Circuit Breaker, Saga, API Gateway, Outbox, etc.)
- **Tiered Architecture Diagram**: Visual representation of proposed microservices organized by tier (Gateway → API → Worker → Data-Service)
- **Migration Strategy**: Phased approach using Strangler Fig pattern with specific services per phase
- **Kubernetes Best Practices**: Deployment recommendations, resource configurations, scaling strategies
- **Data Management**: Database-per-service strategy with CDC and event-driven architecture
- **Critical for Zero-Knowledge Teams**: Designed for teams migrating legacy apps without domain expertise

### 6. Spec-Kit Export for AI-Driven Implementation
Export executable specifications following the [GitHub Spec-Kit](https://github.com/github/spec-kit) format:

**Individual Service Export**: Click "Spec-Kit" button on any microservice card
**Bulk Export**: "Download All Spec-Kits" downloads specifications for all services

Each export includes:
- **constitution.md**: Development principles, architecture patterns, testing standards, K8s deployment rules
- **spec.md**: Business capabilities, operations, entities, rules, migration compliance requirements with Konveyor violations
- **plan.md**: Technical implementation plan, architecture patterns, technical debt assessment with effort breakdown
- **tasks.md**: Phased task breakdown with actionable items per Konveyor rule violation

**Konveyor Integration**: Each specification includes:
- Specific rule violations mapped to the service (e.g., `hibernate-00005`, `cdi-to-quarkus-00030`)
- Exact file locations and line numbers
- Effort estimates (story points) per violation
- Detailed remediation guidance
- Total technical debt by component

**Ready for AI Agents**: Works with Claude Code, Cursor, GitHub Copilot, Windsurf, and other AI coding assistants

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization
- **React Force Graph** - Network graph visualization
- **Recharts** - Charts and metrics
- **Tailwind CSS** - Styling
- **JSZip** - ZIP file generation for Spec-Kit export
- **Express** - Backend proxy for LLM API calls

## Getting Started

### Prerequisites

- Node.js 18+ or 20+ LTS
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/tsanders-rh/konveyor-viz.git
cd konveyor-viz

# Install dependencies
npm install

# Run development server (frontend)
npm run dev

# Run backend server (for AI features) in a separate terminal
npm run server

# Build for production
npm run build
```

### Development

The application has two parts:

1. **Frontend**: Development server at `http://localhost:5173`
```bash
npm run dev
```

2. **Backend** (for AI features): Server at `http://localhost:3001`
```bash
npm run server
```

Run both in separate terminals for full functionality.

### Building

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
konveyor-viz/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx                    # Main container
│   │   │   ├── MetricsOverview.jsx              # Metrics cards
│   │   │   ├── AIInsights.jsx                   # AI-powered recommendations
│   │   │   └── TechnologyStack.jsx              # Tech status grid
│   │   ├── Visualizations/
│   │   │   ├── ArchitectureGraph.jsx            # Force-directed graph
│   │   │   ├── IssueBreakdown.jsx               # Bar chart
│   │   │   ├── MicroservicesDecomposition.jsx   # AI microservices strategy
│   │   │   ├── MicroservicesTierDiagram.jsx     # D3 tier visualization
│   │   │   ├── BusinessLogicDocumentation.jsx   # Business logic extraction
│   │   │   └── SpecKitExportButton.jsx          # Spec-Kit download button
│   │   ├── DetailPanel/
│   │   │   ├── ComponentDetail.jsx              # Slide-in panel
│   │   │   └── IssueList.jsx                    # Issue list
│   │   └── Layout/
│   │       └── Header.jsx                       # App header
│   ├── data/
│   │   └── sampleData.json                      # Mock Konveyor report
│   ├── services/
│   │   └── llmService.js                        # LLM API integration
│   ├── config/
│   │   └── llmConfig.js                         # LLM provider configuration
│   ├── utils/
│   │   ├── colorUtils.js                        # Severity colors
│   │   ├── dataParser.js                        # Data transformations
│   │   ├── specKitGenerator.js                  # Spec-Kit file generation
│   │   └── downloadUtils.js                     # ZIP creation and download
│   ├── App.jsx
│   └── main.jsx
├── server.js                                    # Express backend for LLM calls
├── package.json
├── .env.example                                 # Environment template
└── README.md
```

## Data Format

The tool expects Konveyor analysis reports in JSON format with the following structure:

```json
{
  "applicationName": "App Name",
  "analysisDate": "2026-01-20",
  "summary": {
    "totalComponents": 8,
    "totalIssues": 237,
    "linesOfCode": 85000
  },
  "components": [
    {
      "id": "component-id",
      "name": "Component Name",
      "type": "backend|frontend|middleware|data",
      "linesOfCode": 25000,
      "technology": {
        "language": "Java",
        "version": "8",
        "framework": "Spring Boot",
        "frameworkStatus": "eol|outdated|current"
      },
      "issues": [
        {
          "id": "issue-1",
          "title": "Issue title",
          "type": "Security|Configuration|etc",
          "severity": "critical|warning|info",
          "description": "Issue description",
          "location": "file.java:123",
          "effort": 3,
          "ruleId": "hibernate-00005"
        }
      ],
      "dependencies": ["other-component-id"]
    }
  ],
  "dependencies": [
    {
      "source": "component-id",
      "target": "component-id",
      "type": "http|jdbc|internal"
    }
  ]
}
```

## Usage

### Viewing the Sample Data

The application loads sample data automatically from `src/data/sampleData.json`. This includes:
- E-Commerce platform with 8 components
- 237 total issues across different severity levels
- Multiple technology stacks (Java, JavaScript, Python, Node.js)
- Component dependencies showing application architecture

### Interacting with the Graph

- **Click** a node to view component details
- **Drag** nodes to reposition
- **Scroll** to zoom in/out
- **Click and drag** background to pan

### Understanding the Metrics

- **Health Score**: Calculated as `100 - (critical×2 + warning×1 + info×0.5) / totalComponents`
- **Color Coding**: Consistent across all visualizations
  - Critical issues: Red (#ff6b6b)
  - Warnings: Yellow (#ffd93d)
  - Info: Gray (#6c757d)
  - Good: Green (#95e1d3)

### Using Microservices Decomposition

1. **Configure AI Provider**: Set up API key in `.env` file (Anthropic, OpenAI, or Ollama)
2. **Navigate to Decomposition Tab**: Click "Microservices Decomposition" in the dashboard
3. **Generate Strategy**: Click "Generate Microservices Strategy" button
4. **Review Results**:
   - **Strategy Overview**: High-level summary of the recommended approach
   - **Discovered Business Logic**: Reverse-engineered business capabilities from code
   - **Proposed Architecture**: Interactive tier diagram showing service relationships
   - **Proposed Microservices**: Detailed cards for each service with responsibilities and patterns
   - **Migration Strategy**: Phased rollout plan with Strangler Fig pattern
   - **Kubernetes Recommendations**: Deployment best practices
   - **Data Management Strategy**: Database and event-driven architecture guidance

5. **Export Spec-Kits**:
   - **Individual Service**: Click "Spec-Kit" button on any microservice card
   - **All Services**: Click "Download All Spec-Kits" button at the bottom
   - Each export contains 4 markdown files + README ready for AI coding agents

### Using Spec-Kit Files with AI Agents

After exporting Spec-Kit files:

1. **Extract the ZIP** to your workspace
2. **Review the specifications**:
   - `constitution.md`: Understand the principles and patterns
   - `spec.md`: Review business requirements and Konveyor violations to fix
   - `plan.md`: Check technical debt and effort estimates
   - `tasks.md`: See actionable implementation tasks
3. **Use with your AI coding agent**:
   - **Claude Code**: Open the folder and start implementing
   - **Cursor**: Load specs and ask for implementation
   - **GitHub Copilot**: Reference specs while coding
4. **Track progress**: Check off tasks in `tasks.md` as you complete them
5. **Fix violations**: Each Konveyor violation has specific location, effort, and fix description

## AI-Powered Insights

The tool supports AI-generated insights using multiple LLM providers:

### Supported Providers

1. **Anthropic (Claude)** - Recommended
2. **OpenAI (GPT-4)**
3. **Ollama (Local)** - For offline/private deployments

### Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Add your API key for at least one provider:
```bash
# For Anthropic (Claude)
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx

# For OpenAI (GPT)
VITE_OPENAI_API_KEY=sk-xxxxx

# For Ollama (Local)
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama2
```

3. Restart the development server:
```bash
npm run dev
```

4. Click "Use AI" in the Insights panel to enable AI-powered recommendations

### AI vs Rule-Based Analysis

- **Without API key**: Uses rule-based algorithmic analysis
- **With API key**: Toggle between AI-powered and rule-based insights
- **AI Mode**: Provides context-aware, natural language recommendations
- **Rule-Based Mode**: Fast, deterministic pattern detection

### What AI Provides

**General Insights**:
- Priority recommendations based on architectural impact
- Risk assessment with nuanced understanding of issue context
- Migration roadmap with phased approach
- Pattern insights that go beyond simple counting

**Microservices Decomposition** (click "Generate Microservices Strategy"):
- Intelligent service boundary identification using Domain-Driven Design
- Business logic extraction from legacy components (for zero-knowledge teams)
- Architecture pattern recommendations (Circuit Breaker, Saga, API Gateway, etc.)
- Phased migration strategy with Strangler Fig pattern
- Kubernetes deployment best practices
- Data management strategy (Database-per-service, CDC, event-driven)
- Downloadable Spec-Kit files for each microservice with Konveyor violations integrated

## Future Enhancements

- [x] AI-generated insights and recommendations
- [x] Microservices decomposition visualizer with tiered architecture diagram
- [x] Business logic extraction from legacy code
- [x] Spec-Kit export for AI-driven implementation
- [x] Integration of Konveyor rule violations into implementation tasks
- [ ] Upload real Konveyor report files
- [ ] Migration roadmap timeline visualization
- [ ] Export visualizations (PNG/PDF)
- [ ] Integration with GitHub for code browsing
- [ ] Search and filter functionality
- [ ] Comparison between multiple analysis runs
- [ ] Real-time collaboration features
- [ ] Cost estimation for migration effort

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

Built as a prototype to demonstrate the value of visual representation in application modernization analysis.
