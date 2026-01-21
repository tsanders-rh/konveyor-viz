# Konveyor Visual Analysis Tool

An interactive web-based visualization tool that transforms Konveyor static analysis reports into visual, easy-to-understand representations.

![Konveyor Viz](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3-cyan)

## Overview

This tool addresses the challenge of digesting lengthy Konveyor analysis reports (often 50+ pages) by providing:

- **Interactive Architecture Graph**: Force-directed network visualization showing application components and their dependencies
- **Issue Dashboard**: Visual metrics and breakdowns of issues by type and severity
- **Component Details**: Detailed view of each component with issue lists and technology stack
- **Technology Status**: At-a-glance view of technology stack health (EOL/Outdated/Current)

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

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization
- **React Force Graph** - Network graph visualization
- **Recharts** - Charts and metrics
- **Tailwind CSS** - Styling

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

# Run development server
npm run dev

# Build for production
npm run build
```

### Development

The development server will start at `http://localhost:5173`

```bash
npm run dev
```

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
│   │   │   ├── Dashboard.jsx          # Main container
│   │   │   ├── MetricsOverview.jsx    # Metrics cards
│   │   │   └── TechnologyStack.jsx    # Tech status grid
│   │   ├── Visualizations/
│   │   │   ├── ArchitectureGraph.jsx  # Force-directed graph
│   │   │   └── IssueBreakdown.jsx     # Bar chart
│   │   ├── DetailPanel/
│   │   │   ├── ComponentDetail.jsx    # Slide-in panel
│   │   │   └── IssueList.jsx          # Issue list
│   │   └── Layout/
│   │       └── Header.jsx             # App header
│   ├── data/
│   │   └── sampleData.json            # Mock Konveyor report
│   ├── utils/
│   │   ├── colorUtils.js              # Severity colors
│   │   └── dataParser.js              # Data transformations
│   ├── App.jsx
│   └── main.jsx
├── package.json
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
          "location": "file.java:123"
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

- Priority recommendations based on architectural impact
- Risk assessment with nuanced understanding of issue context
- Migration roadmap with phased approach
- Pattern insights that go beyond simple counting

## Future Enhancements

- [x] AI-generated insights and recommendations
- [ ] Upload real Konveyor report files
- [ ] Microservices decomposition visualizer
- [ ] Migration roadmap timeline
- [ ] Export visualizations (PNG/PDF)
- [ ] Integration with GitHub for code browsing
- [ ] Search and filter functionality
- [ ] Comparison between multiple analysis runs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

Built as a prototype to demonstrate the value of visual representation in application modernization analysis.
