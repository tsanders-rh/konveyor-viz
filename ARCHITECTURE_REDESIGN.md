# Architecture Redesign: Multi-Source Legacy Application Analysis

**Document Version**: 1.0
**Date**: 2026-01-21
**Status**: Proposed

---

## Executive Summary

This document proposes a fundamental redesign of the Konveyor Visual Analysis Tool to support real-world enterprise migration scenarios involving:
- Multiple programming languages (COBOL, Java, JavaScript, Python, etc.)
- Multiple source repositories (polyglot microservices, monorepo, multi-repo)
- Language transformation (not just framework migration)
- Optional Konveyor integration (works with or without Kantra reports)

### Current Limitation
The tool currently assumes:
1. Single Konveyor analysis report
2. Single technology stack
3. Konveyor rules exist for migration path (e.g., J2EE → Quarkus)
4. Single GitHub repository (optional Tier 3 enhancement)

### Proposed Solution
Transform the tool into a multi-source, language-agnostic legacy application analyzer that:
1. Accepts multiple inputs (Konveyor reports, GitHub repos, source uploads)
2. Analyzes any programming language
3. Works without Konveyor rules for language transformation scenarios
4. Consolidates business logic across repositories
5. Generates unified microservices decomposition

---

## Problem Statement

### Problem 1: Konveyor Rules Are Framework-Specific, Not Language-Agnostic

**What Konveyor Supports:**
```
Source Framework → Target Framework (SAME LANGUAGE)
✅ J2EE → Quarkus (Java → Java)
✅ Spring Boot 2 → Spring Boot 3 (Java → Java)
✅ PatternFly 5 → PatternFly 6 (React → React)
✅ WebLogic → JBoss EAP (Java → Java)
```

**What Konveyor Does NOT Support:**
```
Source Language → Target Language
❌ COBOL → Java
❌ VB.NET → C#
❌ Perl → Python
❌ PHP → Go
```

**Impact:**
- Language transformation projects have no Konveyor rules
- No violations, effort estimates, or migration guidance
- Current tool provides minimal value without Konveyor violations
- Business logic extraction still valuable, but no compliance tracking

**Example Scenario:**
```
Legacy System: COBOL/CICS mainframe application
Target: Java/Quarkus microservices

Konveyor Analysis: No applicable rulesets exist
Tool Value: Limited to basic structure analysis
Missing: Business logic extraction, microservices decomposition
```

### Problem 2: Real Applications Span Multiple Languages and Repositories

**Typical Enterprise Architecture:**
```
E-Commerce Application:
├── Backend API (Java/Spring Boot)
│   └── Repository: github.com/company/ecommerce-backend
│   └── Kantra Analysis: J2EE → Quarkus rules
│
├── Web Frontend (React/JavaScript)
│   └── Repository: github.com/company/ecommerce-web
│   └── Kantra Analysis: React 16 → React 19 rules
│
├── Admin Portal (Django/Python)
│   └── Repository: github.com/company/admin-portal
│   └── Kantra Analysis: Not available (no Django rulesets)
│
└── Mobile App (React Native)
    └── Repository: github.com/company/mobile-ios
    └── Kantra Analysis: Shared with web frontend
```

**Current Tool Limitation:**
- Can only load ONE Kantra report at a time
- Cannot combine analysis from multiple repos
- Cannot map business logic across repositories
- No understanding of cross-language dependencies

**Impact:**
- Cannot analyze complete application architecture
- Missing critical business logic that spans repos
- Microservices decomposition incomplete
- Each repo analyzed in isolation (loses context)

### Problem 3: Business Logic Spans Repository Boundaries

**Example: Order Checkout Business Capability**

**Backend (Java):**
```java
// OrderController.java
@PostMapping("/orders")
public Order createOrder(OrderRequest request) {
    // Business rules:
    // 1. Premium customers get 10% discount
    // 2. Tax rate = 8% of subtotal
    // 3. Free shipping over $100

    double subtotal = calculateSubtotal(request.items);
    double discount = customer.isPremium() ? subtotal * 0.10 : 0;
    double tax = (subtotal - discount) * 0.08;
    double shipping = subtotal >= 100 ? 0 : 9.99;

    return orderService.create(subtotal, discount, tax, shipping);
}
```

**Frontend (React):**
```javascript
// CheckoutForm.jsx
function validateOrder(cart, customer) {
  // SAME business rules duplicated in frontend:
  // 1. Premium customers get 10% discount
  // 2. Tax rate = 8% of subtotal
  // 3. Free shipping over $100

  const subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
  const discount = customer.isPremium ? subtotal * 0.10 : 0;
  const tax = (subtotal - discount) * 0.08;
  const shipping = subtotal >= 100 ? 0 : 9.99;

  return { subtotal, discount, tax, shipping };
}
```

**Current Tool Behavior:**
- Analyzes backend repo → Extracts order calculation logic
- Analyzes frontend repo → Extracts order validation logic
- **DOES NOT RECOGNIZE** these are the same business rules
- Generates TWO separate business logic entries
- Spec-Kit might duplicate or contradict rules

**Desired Behavior:**
- Recognize identical business logic across repos
- Consolidate into single "Order Checkout" business capability
- Document that logic exists in both backend and frontend
- Generate ONE Spec-Kit with unified business rules
- Note implementation should centralize logic (no duplication)

### Problem 4: Konveyor Analysis May Not Exist

**Scenarios Where Konveyor Cannot Help:**

1. **Unsupported Languages:**
   - COBOL without modern rulesets
   - Legacy VB6, PowerBuilder, Delphi
   - Proprietary/in-house languages

2. **Unsupported Frameworks:**
   - Custom frameworks with no Konveyor rules
   - In-house MVC frameworks
   - Legacy CMS systems

3. **Language Transformation:**
   - COBOL → Java (no ruleset)
   - Perl → Python (no ruleset)
   - PHP → Go (no ruleset)

4. **Closed-Source Dependencies:**
   - Code not accessible for analysis
   - Third-party libraries without source

**Current Tool Impact:**
- Tool provides minimal value without Konveyor
- No violations = empty Spec-Kit compliance section
- Business logic extraction still works (Tier 2/3)
- But tool feels "incomplete" without violations

**Desired Behavior:**
- Tool should be USEFUL without Konveyor
- Focus on business logic extraction as primary value
- Konveyor violations are ENHANCEMENT, not requirement
- Alternative technical debt analysis when no Konveyor rules

---

## Proposed Solution

### New Tool Vision

**FROM:**
> "Konveyor analysis visualization tool with AI-powered microservices decomposition and Spec-Kit export"

**TO:**
> "Multi-source, language-agnostic legacy application analyzer that extracts business logic, identifies technical debt, and generates microservices Spec-Kits for AI-driven implementation (Konveyor-enhanced when available)"

### Core Capabilities

#### 1. Multi-Source Input Architecture

**Support Three Input Types:**

**Type A: Konveyor Analysis Reports (Optional)**
```
Use Case: When Konveyor rules exist for your migration path
Examples: J2EE → Quarkus, Spring Boot 2 → 3, PatternFly 5 → 6

Value Added:
✅ Standardized violation rules with IDs
✅ Effort estimates (story points)
✅ Migration guidance and best practices
✅ Component classification
✅ Dependency mapping
✅ Code snippets

Input Method:
- Load multiple Kantra YAML reports
- Combine into unified application view
- Map violations to proposed microservices
```

**Type B: GitHub Repositories (Primary)**
```
Use Case: Direct source code analysis, any language
Examples: COBOL → Java, multi-repo applications, unsupported frameworks

Value Added:
✅ Complete source code access (Tier 3 quality)
✅ Business logic extraction from full implementations
✅ Works for any programming language
✅ Cross-repo business logic mapping
✅ No dependency on Konveyor rulesets

Input Method:
- Add multiple GitHub repository URLs
- Specify language/framework for each repo
- Tool fetches and analyzes source
- LLM extracts business logic
```

**Type C: Direct Source Upload (Fallback)**
```
Use Case: Non-GitHub code, private/air-gapped environments
Examples: Internal GitLab, on-prem source control, uploaded ZIP files

Value Added:
✅ Works in restricted environments
✅ Supports any source control system
✅ No external dependencies

Input Method:
- Upload source files or ZIP archive
- Manual component classification
- Same LLM analysis as GitHub mode
```

#### 2. Multi-Repo Application Modeling

**Data Model:**

```javascript
Application {
  name: string
  description: string

  // Multiple source repositories
  repositories: [
    {
      id: string
      name: string
      url: string  // e.g., "github.com/company/backend-api"
      type: "backend" | "frontend" | "admin" | "mobile" | "other"
      language: "java" | "javascript" | "python" | "cobol" | "go" | ...
      framework: "spring-boot" | "react" | "django" | "cics" | ...

      // Components within this repo
      components: [
        { name: string, type: string, files: [...] }
      ]

      // Optional Konveyor analysis for this repo
      kantraAnalysis: {
        reportPath: string
        violations: [...]
        snippets: [...]
      }
    }
  ]

  // Cross-repo business logic mapping
  businessCapabilities: [
    {
      name: "Order Checkout"
      description: "Handles order creation with pricing and validation"

      // This capability spans multiple repos
      implementations: [
        { repoId: "backend", component: "OrderController", role: "primary" },
        { repoId: "frontend", component: "CheckoutForm", role: "validation" },
        { repoId: "mobile", component: "CheckoutScreen", role: "validation" }
      ]

      // Consolidated business logic from all implementations
      operations: ["calculateTotal", "applyDiscount", "validateOrder"]
      entities: ["Order", "Customer", "LineItem"]
      rules: [
        "Premium customers receive 10% discount",
        "Tax rate is 8% of subtotal",
        "Free shipping on orders over $100"
      ]

      // Note duplications
      duplications: [
        {
          logic: "Discount calculation",
          locations: ["backend/OrderController.java:45", "frontend/CheckoutForm.jsx:23"],
          recommendation: "Centralize in backend API, remove frontend duplication"
        }
      ]
    }
  ]

  // Proposed microservices (spans repos)
  microservices: [
    {
      name: "Order Management Service"
      description: "..."

      // Sources from multiple repos
      sources: [
        { repoId: "backend", components: ["OrderController", "OrderService"] },
        { repoId: "frontend", components: ["CheckoutForm"] }  // UI logic only
      ]

      // Konveyor violations from all source repos
      violations: [
        { repoId: "backend", ruleId: "hibernate-00005", ... },
        { repoId: "frontend", ruleId: "react-16-to-19", ... }
      ]
    }
  ]
}
```

#### 3. Language-Agnostic Business Logic Extraction

**Enhanced LLM Analysis:**

**Current Approach (Single Source):**
```javascript
// Analyze one Kantra report
const businessLogic = await llm.extractBusinessLogic({
  components: kantraData.components,
  codeSnippets: kantraData.snippets,
  fullSource: githubSource  // Optional Tier 3
});
```

**New Approach (Multi-Source):**
```javascript
// Analyze multiple sources
const businessLogic = await llm.extractBusinessLogic({
  // Input from multiple sources
  sources: [
    {
      type: "kantra",
      language: "java",
      framework: "spring-boot",
      components: [...],
      snippets: [...],
      violations: [...]
    },
    {
      type: "github",
      language: "javascript",
      framework: "react",
      repoUrl: "github.com/company/frontend",
      sourceFiles: [...]
    },
    {
      type: "github",
      language: "cobol",
      framework: "cics",
      repoUrl: "github.com/company/legacy-mainframe",
      sourceFiles: [...]
    }
  ],

  // Cross-source analysis instructions
  instructions: {
    detectDuplicateLogic: true,
    consolidateBusinessRules: true,
    mapCrossLanguageDependencies: true,
    identifySharedEntities: true
  }
});

// LLM returns consolidated business capabilities
{
  capabilities: [
    {
      name: "Order Processing",
      implementations: [
        { source: "java-backend", component: "OrderService", role: "primary" },
        { source: "cobol-mainframe", component: "ORDPRC01", role: "legacy" },
        { source: "react-frontend", component: "OrderForm", role: "validation" }
      ],
      consolidatedLogic: {
        operations: ["calculateTotal", "applyDiscount", "validateOrder"],
        entities: ["Order", "Customer", "LineItem"],
        rules: [
          "Premium customers get 10% discount (found in: Java, COBOL, React)",
          "Tax = 8% of subtotal (found in: Java, COBOL)",
          "Minimum order $25 (found in: COBOL only - legacy rule)"
        ]
      },
      duplications: [
        "Discount logic duplicated in Java and React - centralize in backend",
        "COBOL has minimum order rule not in Java - verify if still needed"
      ],
      migrations: [
        "COBOL ORDPRC01 → Java OrderService (language transformation)",
        "React validation → Remove, trust backend API"
      ]
    }
  ]
}
```

**LLM Prompt Template:**

```markdown
You are analyzing a multi-language, multi-repository legacy application for microservices decomposition.

# SOURCES

## Source 1: Backend API (Java/Spring Boot)
Repository: github.com/company/backend-api
Language: Java
Framework: Spring Boot 2.7

Components:
- OrderController (REST API endpoints)
- OrderService (business logic)
- CustomerService (customer management)

Code Snippets:
[Full source code from GitHub...]

Konveyor Analysis (J2EE → Quarkus):
- hibernate-00005: Update JPA configuration (Effort: 3 SP)
- cdi-to-quarkus-00030: Migrate CDI to Quarkus DI (Effort: 5 SP)
[...violations...]

## Source 2: Web Frontend (JavaScript/React 16)
Repository: github.com/company/web-frontend
Language: JavaScript
Framework: React 16

Components:
- CheckoutForm (order creation UI)
- CustomerProfile (customer details UI)

Code Snippets:
[Full source code from GitHub...]

Konveyor Analysis (React 16 → React 19):
- react-dom-render: Update to createRoot API (Effort: 2 SP)
[...violations...]

## Source 3: Legacy Mainframe (COBOL/CICS)
Repository: github.com/company/mainframe-legacy
Language: COBOL
Framework: CICS

Components:
- ORDPRC01 (Order processing program)
- CUSTDB03 (Customer database access)

Code Snippets:
[Full COBOL source code...]

Konveyor Analysis: Not available (no COBOL → Java rulesets)

# TASK

Analyze ALL sources and extract unified business capabilities:

1. **Identify Business Capabilities**: What business functions exist across ALL sources?

2. **Detect Duplicate Logic**: Find the SAME business rules implemented in multiple sources
   - Example: Discount calculation in Java, COBOL, and React
   - Mark as duplication and recommend consolidation

3. **Consolidate Business Rules**: Merge identical rules from different sources
   - If Java and COBOL both calculate 10% discount, it's ONE rule (not two)
   - Note which sources implement each rule

4. **Find Inconsistencies**: Identify business rules that DIFFER across sources
   - Example: COBOL has minimum order $25, Java doesn't
   - Flag as potential bug or deprecated rule

5. **Map Cross-Language Dependencies**: How do components interact across languages?
   - Frontend calls Backend API
   - Backend queries Legacy COBOL data

6. **Propose Microservices**: Suggest service boundaries that:
   - Consolidate duplicate logic
   - Eliminate cross-language duplication
   - Modernize legacy components
   - Respect business domain boundaries

7. **Include Konveyor Violations**: Where available, map violations to microservices
   - Backend violations → Backend-sourced services
   - Frontend violations → Frontend-sourced services
   - No violations for COBOL (none available)

8. **Identify Technical Debt**: For sources WITHOUT Konveyor analysis:
   - Legacy patterns (COBOL CICS calls, VSAM files)
   - Deprecated APIs
   - Security concerns
   - Performance bottlenecks

# OUTPUT FORMAT

Return comprehensive business analysis:

{
  "businessCapabilities": [
    {
      "name": "Order Processing",
      "description": "Handles order creation, pricing, and validation",
      "implementations": [
        { "source": "backend-java", "component": "OrderService", "role": "primary-api" },
        { "source": "mainframe-cobol", "component": "ORDPRC01", "role": "legacy-implementation" },
        { "source": "frontend-react", "component": "CheckoutForm", "role": "client-validation" }
      ],
      "operations": ["calculateTotal", "applyDiscount", "validateOrder", "submitOrder"],
      "entities": ["Order", "Customer", "LineItem", "PaymentMethod"],
      "rules": [
        {
          "rule": "Premium customers receive 10% discount",
          "sources": ["backend-java:OrderService.java:67", "mainframe-cobol:ORDPRC01.cbl:145", "frontend-react:CheckoutForm.jsx:23"],
          "status": "duplicated",
          "recommendation": "Centralize in backend API, remove frontend duplication"
        },
        {
          "rule": "Tax rate is 8% of subtotal",
          "sources": ["backend-java:OrderService.java:72", "mainframe-cobol:ORDPRC01.cbl:152"],
          "status": "duplicated"
        },
        {
          "rule": "Minimum order amount is $25",
          "sources": ["mainframe-cobol:ORDPRC01.cbl:134"],
          "status": "legacy-only",
          "recommendation": "Verify if still required - not enforced in Java backend"
        }
      ],
      "technicalDebt": [
        {
          "issue": "Business logic duplicated across 3 languages",
          "impact": "Maintenance burden, consistency risk",
          "recommendation": "Consolidate in single microservice"
        },
        {
          "issue": "COBOL uses VSAM file access",
          "impact": "Not cloud-native, mainframe dependency",
          "recommendation": "Migrate to relational database"
        }
      ]
    }
  ],

  "microservices": [
    {
      "name": "Order Management Service",
      "type": "api",
      "description": "Unified order processing service",
      "sources": [
        { "repoId": "backend-java", "components": ["OrderService", "OrderController"] },
        { "repoId": "mainframe-cobol", "components": ["ORDPRC01"] }
      ],
      "targetTechnology": {
        "language": "Java",
        "framework": "Quarkus 3",
        "rationale": "Migrate from COBOL to Java, modernize Spring Boot to Quarkus"
      },
      "businessLogic": [
        {
          "domain": "Order Processing",
          "operations": ["calculateTotal", "applyDiscount", "validateOrder"],
          "entities": ["Order", "Customer", "LineItem"],
          "rules": [
            "Premium customers receive 10% discount",
            "Tax rate is 8% of subtotal",
            "Free shipping on orders over $100"
          ],
          "criticalLogic": "calculateTotal: subtotal = price * qty, discount = subtotal * 0.10 if premium, tax = (subtotal - discount) * 0.08, total = subtotal - discount + tax"
        }
      ],
      "konveyorViolations": [
        {
          "source": "backend-java",
          "ruleId": "hibernate-00005",
          "title": "Update JPA configuration",
          "effort": 3,
          "location": "OrderService.java:45"
        }
      ],
      "technicalDebtPatterns": [
        {
          "source": "mainframe-cobol",
          "pattern": "VSAM file access",
          "description": "ORDPRC01 uses VSAM indexed files",
          "migration": "Replace with JPA/Hibernate entity persistence",
          "effort": 13
        }
      ]
    }
  ]
}
```

#### 4. Konveyor as Optional Enhancement

**Architecture Change:**

**BEFORE (Konveyor Required):**
```
Konveyor Report → Tool → Visualization → Microservices → Spec-Kit
                   ↑
                Required
```

**AFTER (Konveyor Optional):**
```
            ┌─ Konveyor Report (OPTIONAL)
            │  ├─ Violations
            │  ├─ Effort estimates
            │  └─ Migration rules
            │
Input  ──→  ├─ GitHub Repos (PRIMARY)
            │  ├─ Full source code
            │  ├─ Any language
            │  └─ Business logic
            │
            └─ Source Upload (FALLBACK)
               └─ Direct file upload
                   ↓
                  Tool
                   ↓
          Multi-Source Analysis
                   ↓
         Business Logic Extraction
                   ↓
      Microservices Decomposition
                   ↓
            Spec-Kit Export
            (with or without Konveyor violations)
```

**Spec-Kit Generation Logic:**

```javascript
function generateSpecKit(service, businessLogic, sources, konveyorData) {
  let spec = generateBaseSpec(service, businessLogic);

  // Add Konveyor violations if available
  if (konveyorData && konveyorData.violations.length > 0) {
    spec += generateKonveyorComplianceSection(konveyorData.violations);
  } else {
    // Alternative: Technical debt analysis without Konveyor
    spec += generateTechnicalDebtSection(sources);
  }

  return spec;
}
```

**Example Spec-Kit (Without Konveyor):**

```markdown
# Order Management Service - Functional Specification

## Business Capabilities

### Order Processing
**Description**: Handles order creation, pricing, and validation

**Complexity**: Medium

#### Business Operations
- calculateTotal()
- applyDiscount()
- validateOrder()

#### Domain Entities
- Order (itemPrice, quantity, orderTotal, tax)
- Customer (customerType, customerId)

#### Business Rules
- Premium customers receive 10% discount
- Tax rate is 8% of subtotal
- Free shipping on orders over $100

#### Critical Logic Requirements
calculateTotal: Multiplies item price by quantity, applies 10% discount for
premium customers, adds 8% tax to final total.

#### Source Components (Legacy Mapping)
- `ORDPRC01.cbl` (COBOL - mainframe legacy)
- `OrderService.java` (Java - current backend)
- `CheckoutForm.jsx` (React - frontend validation)

## Technical Debt Analysis

**Since Konveyor analysis is not available for COBOL sources, the following
technical debt patterns were identified through source code analysis:**

### Mainframe Dependencies (High Priority)

#### VSAM File Access
- **Location**: `ORDPRC01.cbl:145-167`
- **Issue**: Uses VSAM indexed files for order persistence
- **Impact**: Mainframe dependency, not cloud-native
- **Recommendation**: Migrate to PostgreSQL with JPA/Hibernate
- **Estimated Effort**: 13 story points

#### CICS Transaction Processing
- **Location**: `ORDPRC01.cbl:23-45`
- **Issue**: EXEC CICS calls for transaction management
- **Impact**: Tightly coupled to CICS runtime
- **Recommendation**: Replace with Spring @Transactional or Quarkus Panache
- **Estimated Effort**: 8 story points

### Code Duplication (Medium Priority)

#### Duplicated Discount Calculation
- **Locations**:
  - `ORDPRC01.cbl:152` (COBOL)
  - `OrderService.java:67` (Java)
  - `CheckoutForm.jsx:23` (React)
- **Issue**: Same business rule implemented in 3 places
- **Impact**: Maintenance burden, inconsistency risk
- **Recommendation**: Centralize in Order Management Service API
- **Estimated Effort**: 5 story points

### Language Transformation (High Priority)

#### COBOL to Java Migration
- **Component**: ORDPRC01.cbl
- **Issue**: Legacy COBOL program needs modernization
- **Target**: Java/Quarkus microservice
- **Challenges**:
  - COBOL copybook structures → JPA entities
  - Paragraph-based logic → Object-oriented design
  - VSAM files → Relational database
- **Estimated Effort**: 34 story points

## Migration Approach

**Phase 1: Strangler Fig Pattern**
1. Implement new Order Management Service in Quarkus
2. Extract business logic from COBOL and Java sources
3. Keep COBOL running in parallel
4. Route new orders to Quarkus service
5. Gradually migrate existing orders

**Phase 2: Data Migration**
1. Export VSAM data to PostgreSQL
2. Validate data integrity
3. Cutover to new database

**Phase 3: Decommission Legacy**
1. Verify all orders processed by new service
2. Archive COBOL programs
3. Decommission mainframe dependency
```

---

## Technical Design

### New UI Components

#### 1. Multi-Source Input Panel

```jsx
// New component: src/components/Input/MultiSourceInput.jsx

<MultiSourceInput>
  <Tabs>
    <Tab label="Konveyor Reports">
      <KantraReportLoader>
        <FileUpload label="Backend Analysis" />
        <FileUpload label="Frontend Analysis" />
        <Button>Add More Reports</Button>
      </KantraReportLoader>
    </Tab>

    <Tab label="GitHub Repositories">
      <GitHubRepoList>
        <RepoInput
          name="Backend API"
          url="github.com/company/backend"
          language="Java"
          framework="Spring Boot 2"
        />
        <RepoInput
          name="Web Frontend"
          url="github.com/company/frontend"
          language="JavaScript"
          framework="React 16"
        />
        <Button>Add Repository</Button>
      </GitHubRepoList>
    </Tab>

    <Tab label="Upload Source Files">
      <SourceUpload>
        <FileUpload
          label="Upload ZIP or individual files"
          accept=".zip,.java,.js,.py,.cbl,.cob"
        />
      </SourceUpload>
    </Tab>
  </Tabs>

  <Button variant="primary">Analyze Application</Button>
</MultiSourceInput>
```

#### 2. Repository Management View

```jsx
// src/components/Repositories/RepositoryList.jsx

<RepositoryList>
  {repositories.map(repo => (
    <RepositoryCard key={repo.id}>
      <CardHeader>
        {repo.name}
        <Label color={repo.kantraAnalysis ? 'green' : 'orange'}>
          {repo.kantraAnalysis ? 'Konveyor Enhanced' : 'Source Only'}
        </Label>
      </CardHeader>

      <CardBody>
        <DescriptionList>
          <Term>Repository</Term>
          <Description>{repo.url}</Description>

          <Term>Language</Term>
          <Description>{repo.language}</Description>

          <Term>Framework</Term>
          <Description>{repo.framework}</Description>

          <Term>Components</Term>
          <Description>{repo.components.length}</Description>

          {repo.kantraAnalysis && (
            <>
              <Term>Violations</Term>
              <Description>{repo.kantraAnalysis.violations.length}</Description>
            </>
          )}
        </DescriptionList>
      </CardBody>

      <CardActions>
        <Button variant="link">View Details</Button>
        <Button variant="link">Edit</Button>
        <Button variant="danger">Remove</Button>
      </CardActions>
    </RepositoryCard>
  ))}
</RepositoryList>
```

#### 3. Business Capability Consolidation View

```jsx
// src/components/BusinessLogic/BusinessCapabilityList.jsx

<BusinessCapabilityList>
  {capabilities.map(capability => (
    <ExpandableSection title={capability.name}>
      <Grid hasGutter>
        <GridItem span={6}>
          <Card>
            <CardTitle>Implementations</CardTitle>
            <CardBody>
              {capability.implementations.map(impl => (
                <div key={impl.source}>
                  <strong>{impl.source}</strong>: {impl.component}
                  <Label>{impl.role}</Label>
                </div>
              ))}
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={6}>
          <Card>
            <CardTitle>Business Rules</CardTitle>
            <CardBody>
              {capability.rules.map(rule => (
                <div key={rule.rule}>
                  <p>{rule.rule}</p>
                  <small>
                    Sources: {rule.sources.join(', ')}
                  </small>
                  {rule.status === 'duplicated' && (
                    <Alert variant="warning" isInline>
                      Duplicated across {rule.sources.length} sources
                      <br />
                      {rule.recommendation}
                    </Alert>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </ExpandableSection>
  ))}
</BusinessCapabilityList>
```

### Backend API Changes

#### 1. Multi-Source Data Model

```javascript
// server.js - New data structures

// Repository model
class Repository {
  constructor(config) {
    this.id = generateId();
    this.name = config.name;
    this.url = config.url;
    this.type = config.type; // 'backend', 'frontend', 'admin', 'mobile', 'other'
    this.language = config.language;
    this.framework = config.framework;
    this.components = [];
    this.kantraAnalysis = null; // Optional
    this.sourceFiles = []; // From GitHub or upload
  }
}

// Application model (replaces current single-source model)
class Application {
  constructor(name) {
    this.name = name;
    this.repositories = [];
    this.businessCapabilities = [];
    this.microservices = [];
    this.summary = {
      totalRepositories: 0,
      totalComponents: 0,
      totalViolations: 0,
      languages: [],
      frameworks: []
    };
  }

  addRepository(repo) {
    this.repositories.push(repo);
    this.updateSummary();
  }

  updateSummary() {
    this.summary.totalRepositories = this.repositories.length;
    this.summary.totalComponents = this.repositories.reduce(
      (sum, r) => sum + r.components.length, 0
    );
    this.summary.languages = [...new Set(this.repositories.map(r => r.language))];
    this.summary.frameworks = [...new Set(this.repositories.map(r => r.framework))];
  }
}
```

#### 2. New API Endpoints

```javascript
// POST /api/repository/add - Add GitHub repository
app.post('/api/repository/add', async (req, res) => {
  const { name, url, language, framework } = req.body;

  // Create repository
  const repo = new Repository({ name, url, language, framework });

  // Fetch source from GitHub
  const sourceFiles = await githubSourceFetcher.fetchRepository(url);
  repo.sourceFiles = sourceFiles;

  // Analyze with LLM
  const components = await llm.analyzeSourceCode(sourceFiles, language);
  repo.components = components;

  // Add to application
  currentApplication.addRepository(repo);

  res.json({ success: true, repository: repo });
});

// POST /api/kantra/load - Load Kantra report for specific repo
app.post('/api/kantra/load', async (req, res) => {
  const { repositoryId, reportPath } = req.body;

  // Load Kantra YAML
  const kantraData = await loadKantraReport(reportPath);

  // Find repository
  const repo = currentApplication.repositories.find(r => r.id === repositoryId);
  if (!repo) {
    return res.status(404).json({ error: 'Repository not found' });
  }

  // Attach Kantra analysis
  repo.kantraAnalysis = kantraData;

  // Update components with violations
  mergeKantraDataWithComponents(repo);

  res.json({ success: true, repository: repo });
});

// POST /api/analyze/multi-source - Analyze entire application
app.post('/api/analyze/multi-source', async (req, res) => {
  // Build comprehensive prompt for LLM
  const prompt = buildMultiSourceAnalysisPrompt(currentApplication);

  // Send to LLM
  const analysis = await llm.analyzeApplication(prompt);

  // Extract business capabilities (cross-repo)
  currentApplication.businessCapabilities = analysis.businessCapabilities;

  // Generate microservices decomposition
  currentApplication.microservices = analysis.microservices;

  res.json({ success: true, application: currentApplication });
});
```

#### 3. Enhanced GitHub Source Fetcher

```javascript
// src/utils/githubSourceFetcher.js - New functions

/**
 * Fetch entire repository from GitHub
 */
export async function fetchRepository(repoUrl, options = {}) {
  const { branch = 'main', maxFiles = 1000, includePatterns = null } = options;

  // Convert repo URL to GitHub API format
  const apiUrl = convertToApiUrl(repoUrl);

  // Get repository tree
  const tree = await fetchRepoTree(apiUrl, branch);

  // Filter files by pattern if specified
  let files = tree.files;
  if (includePatterns) {
    files = files.filter(f =>
      includePatterns.some(pattern => minimatch(f.path, pattern))
    );
  }

  // Limit file count
  if (files.length > maxFiles) {
    console.warn(`Repository has ${files.length} files, limiting to ${maxFiles}`);
    files = files.slice(0, maxFiles);
  }

  // Fetch file contents in batches
  const sourceFiles = await fetchFileContents(files, { concurrency: 10 });

  return sourceFiles;
}

/**
 * Fetch repository tree from GitHub API
 */
async function fetchRepoTree(apiUrl, branch) {
  const response = await fetch(`${apiUrl}/git/trees/${branch}?recursive=1`);

  if (!response.ok) {
    throw new Error(`Failed to fetch repository tree: ${response.statusText}`);
  }

  const data = await response.json();

  // Filter out directories, keep only files
  const files = data.tree.filter(item => item.type === 'blob');

  return { files, truncated: data.truncated };
}

/**
 * Fetch contents of multiple files
 */
async function fetchFileContents(files, options = {}) {
  const { concurrency = 5 } = options;
  const results = [];

  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const promises = batch.map(async (file) => {
      try {
        const content = await fetchFileContent(file.url);
        return {
          path: file.path,
          content: content,
          size: file.size
        };
      } catch (error) {
        console.error(`Failed to fetch ${file.path}:`, error);
        return null;
      }
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults.filter(Boolean));
  }

  return results;
}
```

#### 4. Multi-Source LLM Prompt Builder

```javascript
// server.js - Enhanced prompt building

function buildMultiSourceAnalysisPrompt(application) {
  let prompt = `You are analyzing a multi-language, multi-repository application for microservices decomposition.\n\n`;

  prompt += `APPLICATION: ${application.name}\n`;
  prompt += `REPOSITORIES: ${application.repositories.length}\n`;
  prompt += `LANGUAGES: ${application.summary.languages.join(', ')}\n\n`;

  // Add each repository's data
  application.repositories.forEach((repo, index) => {
    prompt += `\n## SOURCE ${index + 1}: ${repo.name}\n\n`;
    prompt += `Repository: ${repo.url}\n`;
    prompt += `Language: ${repo.language}\n`;
    prompt += `Framework: ${repo.framework}\n`;
    prompt += `Type: ${repo.type}\n\n`;

    // Add components
    prompt += `Components (${repo.components.length}):\n`;
    repo.components.forEach(c => {
      prompt += `- ${c.name} (${c.type}): ${c.files.length} files\n`;
    });

    // Add Konveyor violations if available
    if (repo.kantraAnalysis && repo.kantraAnalysis.violations) {
      prompt += `\nKonveyor Analysis Available:\n`;
      prompt += `Rule Set: ${repo.kantraAnalysis.ruleSet || 'Unknown'}\n`;
      prompt += `Violations: ${repo.kantraAnalysis.violations.length}\n\n`;

      // Add top violations
      const topViolations = repo.kantraAnalysis.violations
        .sort((a, b) => (b.effort || 0) - (a.effort || 0))
        .slice(0, 10);

      topViolations.forEach(v => {
        prompt += `- [${v.ruleId}] ${v.title} (Effort: ${v.effort || 'N/A'})\n`;
      });
    } else {
      prompt += `\nKonveyor Analysis: Not available\n`;
      prompt += `Note: Perform technical debt analysis from source code\n`;
    }

    // Add source code snippets
    if (repo.sourceFiles && repo.sourceFiles.length > 0) {
      prompt += `\nSource Code (${repo.sourceFiles.length} files):\n\n`;

      // Include representative files (limit to avoid token overflow)
      const representativeFiles = selectRepresentativeFiles(repo.sourceFiles, 10);

      representativeFiles.forEach(file => {
        prompt += `\n### ${file.path}\n`;
        prompt += `\`\`\`${getLanguageForHighlighting(repo.language)}\n`;
        prompt += file.content.substring(0, 5000); // Limit file size
        if (file.content.length > 5000) {
          prompt += `\n... (truncated, ${file.content.length - 5000} more characters)\n`;
        }
        prompt += `\n\`\`\`\n`;
      });
    }

    prompt += `\n---\n`;
  });

  // Add analysis instructions
  prompt += `\n# ANALYSIS INSTRUCTIONS\n\n`;

  prompt += `## 1. Cross-Repository Business Logic Analysis\n`;
  prompt += `Identify business capabilities that span multiple repositories:\n`;
  prompt += `- Look for the SAME business rules in different languages\n`;
  prompt += `- Flag duplicated logic (e.g., discount calculation in Java and JavaScript)\n`;
  prompt += `- Consolidate identical rules into single business capability\n`;
  prompt += `- Note inconsistencies between implementations\n\n`;

  prompt += `## 2. Language-Agnostic Entity Extraction\n`;
  prompt += `Extract domain entities across all languages:\n`;
  prompt += `- Java classes = JavaScript objects = COBOL records = Same entities\n`;
  prompt += `- Identify entity relationships\n`;
  prompt += `- Map legacy data structures to modern equivalents\n\n`;

  prompt += `## 3. Technical Debt Identification\n`;
  prompt += `For repositories WITH Konveyor analysis:\n`;
  prompt += `- Use Konveyor violations as primary technical debt source\n`;
  prompt += `- Include rule IDs, effort estimates, migration guidance\n\n`;

  prompt += `For repositories WITHOUT Konveyor analysis:\n`;
  prompt += `- Analyze source code for anti-patterns\n`;
  prompt += `- Identify legacy dependencies (mainframe, deprecated APIs)\n`;
  prompt += `- Estimate migration effort based on complexity\n`;
  prompt += `- Provide specific recommendations\n\n`;

  prompt += `## 4. Microservices Decomposition\n`;
  prompt += `Propose microservices that:\n`;
  prompt += `- Consolidate duplicate logic from multiple repos\n`;
  prompt += `- Respect domain boundaries\n`;
  prompt += `- Minimize cross-service dependencies\n`;
  prompt += `- Support gradual migration (Strangler Fig pattern)\n\n`;

  prompt += `## 5. Output Format\n\n`;
  prompt += `Return comprehensive analysis in this JSON structure:\n`;
  prompt += JSON.stringify({
    businessCapabilities: [
      {
        name: "Capability Name",
        description: "What it does",
        implementations: [
          { source: "repo-id", component: "ComponentName", role: "primary|legacy|validation" }
        ],
        operations: ["operation1", "operation2"],
        entities: ["Entity1", "Entity2"],
        rules: [
          {
            rule: "Business rule description",
            sources: ["repo1:file.ext:line", "repo2:file.ext:line"],
            status: "duplicated|legacy-only|consistent",
            recommendation: "What to do about it"
          }
        ],
        technicalDebt: [
          {
            issue: "Problem description",
            impact: "Why it matters",
            recommendation: "How to fix"
          }
        ]
      }
    ],
    microservices: [
      {
        name: "Service Name",
        type: "api|worker|gateway|data-service",
        description: "Service purpose",
        sources: [
          { repoId: "repo-id", components: ["Component1", "Component2"] }
        ],
        targetTechnology: {
          language: "Target language",
          framework: "Target framework",
          rationale: "Why this choice"
        },
        businessLogic: [],
        konveyorViolations: [],
        technicalDebtPatterns: []
      }
    ]
  }, null, 2);

  return prompt;
}

/**
 * Select most representative files from a repository
 */
function selectRepresentativeFiles(sourceFiles, maxFiles) {
  // Prioritize certain file types
  const priority = {
    controller: 10,
    service: 9,
    model: 8,
    entity: 8,
    repository: 7,
    component: 6,
    util: 3,
    test: 1
  };

  // Score files based on name
  const scored = sourceFiles.map(file => {
    let score = 0;
    const filename = file.path.toLowerCase();

    for (const [pattern, points] of Object.entries(priority)) {
      if (filename.includes(pattern)) {
        score += points;
      }
    }

    return { file, score };
  });

  // Sort by score and take top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFiles)
    .map(item => item.file);
}
```

### Database Schema (Optional Future Enhancement)

For persisting multi-source applications:

```sql
-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Repositories table
CREATE TABLE repositories (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  type VARCHAR(50), -- 'backend', 'frontend', etc.
  language VARCHAR(50),
  framework VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Components table (from Konveyor or inferred)
CREATE TABLE components (
  id UUID PRIMARY KEY,
  repository_id UUID REFERENCES repositories(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  files JSONB, -- Array of file paths
  code_context JSONB -- Snippets, imports, classes
);

-- Konveyor analyses table
CREATE TABLE kantra_analyses (
  id UUID PRIMARY KEY,
  repository_id UUID REFERENCES repositories(id),
  report_path VARCHAR(500),
  rule_set VARCHAR(100),
  violations JSONB,
  loaded_at TIMESTAMP DEFAULT NOW()
);

-- Business capabilities table (cross-repo)
CREATE TABLE business_capabilities (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  implementations JSONB, -- Array of {repoId, component, role}
  operations JSONB,
  entities JSONB,
  rules JSONB
);

-- Microservices table
CREATE TABLE microservices (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  description TEXT,
  sources JSONB, -- Array of {repoId, components[]}
  target_technology JSONB,
  business_logic JSONB,
  violations JSONB
);
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal**: Multi-repository data model and UI

**Tasks**:
1. ✅ Create new data models (Repository, Application classes)
2. ✅ Build multi-source input UI component
3. ✅ Add repository management view
4. ✅ Update state management to handle multiple repos
5. ✅ Migrate existing single-repo code to multi-repo architecture

**Deliverable**: UI supports adding multiple repositories, displays them in list

### Phase 2: GitHub Integration (Week 3)

**Goal**: Fetch source code from multiple GitHub repositories

**Tasks**:
1. ✅ Enhance githubSourceFetcher.js for full repo fetching
2. ✅ Add repository tree fetching from GitHub API
3. ✅ Implement batch file content fetching
4. ✅ Add file filtering by pattern (*.java, *.js, etc.)
5. ✅ Handle large repositories (pagination, limits)
6. ✅ Add error handling and retry logic

**Deliverable**: Can fetch source code from multiple GitHub repos

### Phase 3: Multi-Source LLM Analysis (Week 4)

**Goal**: LLM analyzes multiple repositories together

**Tasks**:
1. ✅ Build multi-source prompt template
2. ✅ Add cross-repo business logic detection
3. ✅ Implement duplicate logic identification
4. ✅ Add language-agnostic entity extraction
5. ✅ Test with Java + JavaScript example
6. ✅ Test with COBOL + Java example

**Deliverable**: LLM can analyze multi-language applications

### Phase 4: Konveyor Optional Mode (Week 5)

**Goal**: Tool works without Konveyor reports

**Tasks**:
1. ✅ Make Konveyor loading optional
2. ✅ Add "Direct Source Analysis" mode
3. ✅ Implement technical debt analysis without Konveyor
4. ✅ Update Spec-Kit generator for optional violations
5. ✅ Add fallback effort estimation
6. ✅ Test pure GitHub workflow (no Konveyor)

**Deliverable**: Tool generates Spec-Kits without Konveyor

### Phase 5: Business Capability Consolidation (Week 6)

**Goal**: Identify and merge duplicate logic across repos

**Tasks**:
1. ✅ Build business capability comparison algorithm
2. ✅ Add UI for viewing consolidated capabilities
3. ✅ Show duplication warnings
4. ✅ Add recommendation engine
5. ✅ Update Spec-Kits with consolidation notes

**Deliverable**: Tool identifies duplicate business logic

### Phase 6: Testing & Refinement (Week 7-8)

**Goal**: Validate with real-world scenarios

**Test Cases**:
1. ✅ Java monolith → Quarkus microservices (with Konveyor)
2. ✅ COBOL → Java transformation (without Konveyor)
3. ✅ Multi-repo app (Java backend + React frontend)
4. ✅ Polyglot app (Java + Python + JavaScript)
5. ✅ Large enterprise app (10+ repos)

**Tasks**:
1. ✅ Fix bugs discovered during testing
2. ✅ Optimize LLM prompts based on results
3. ✅ Improve UI/UX based on feedback
4. ✅ Add comprehensive error handling
5. ✅ Write end-to-end tests

**Deliverable**: Production-ready multi-source analyzer

---

## Success Criteria

### Must Have (MVP)
- ✅ Support loading multiple GitHub repositories
- ✅ Support loading multiple Konveyor reports (optional)
- ✅ LLM analyzes all sources together
- ✅ Generates unified microservices decomposition
- ✅ Spec-Kits include business logic from all sources
- ✅ Works without Konveyor (direct source analysis)

### Should Have (V1.1)
- ✅ Identify duplicate business logic across repos
- ✅ Consolidate duplicate logic in Spec-Kits
- ✅ Support source file upload (non-GitHub)
- ✅ Technical debt analysis without Konveyor
- ✅ Effort estimation for language transformations

### Nice to Have (Future)
- ⏳ Persist applications to database
- ⏳ Collaborate on decomposition (multi-user)
- ⏳ Export to architecture diagrams (C4, PlantUML)
- ⏳ Integration with Jira (create epics/stories)
- ⏳ Custom rule definitions (user-defined technical debt)

---

## Risks & Mitigations

### Risk 1: LLM Token Limits with Multiple Repos

**Risk**: Large codebases across multiple repos exceed LLM context window

**Mitigation**:
- Implement intelligent file selection (prioritize core files)
- Use summarization for large files
- Break analysis into batches per repo
- Use streaming for large responses
- Consider alternative: Claude 200k context, GPT-4 Turbo 128k

### Risk 2: GitHub API Rate Limits

**Risk**: Fetching large repos hits GitHub API limits

**Mitigation**:
- Implement caching (don't re-fetch unchanged repos)
- Use GitHub authentication tokens (higher rate limits)
- Add retry logic with exponential backoff
- Show progress indicators
- Allow users to upload source directly (bypass GitHub)

### Risk 3: Quality of Cross-Repo Analysis

**Risk**: LLM may not accurately identify duplicate logic across languages

**Mitigation**:
- Provide explicit examples in prompts
- Use structured output format
- Implement confidence scoring
- Allow manual review and adjustment
- Iterate on prompt engineering based on results

### Risk 4: Complexity for Users

**Risk**: Multi-source input is more complex than single Kantra report

**Mitigation**:
- Provide clear wizard-style UI
- Add pre-configured templates (common scenarios)
- Show examples and tooltips
- Support simple mode (single source) and advanced mode (multi-source)
- Comprehensive documentation

### Risk 5: Performance with Large Applications

**Risk**: Analyzing 10+ repos with 1M+ LOC is slow

**Mitigation**:
- Implement background processing
- Show real-time progress
- Allow partial analysis (start with subset)
- Cache LLM responses
- Optimize by analyzing changed files only (incremental)

---

## Open Questions

1. **GitHub Authentication**: Should we support GitHub tokens for private repos? OAuth flow?
2. **Repo Size Limits**: What's the maximum repo size we support? (Files, LOC)
3. **Language Support**: What languages should we prioritize? (Java, JS, Python, COBOL, Go, C#?)
4. **Caching Strategy**: How long to cache GitHub repo data? Invalidation strategy?
5. **Collaboration**: Will multiple users work on same application? Need persistence?
6. **Export Formats**: Besides Spec-Kit, what other formats? (Jira, Azure DevOps, architecture diagrams?)
7. **Custom Rules**: Should users be able to define custom technical debt rules?

---

## Appendix: Example Workflows

### Workflow 1: COBOL → Java Transformation (No Konveyor)

```
1. User creates new application: "Mainframe Order System Migration"

2. Adds GitHub repository:
   - Name: "Legacy Mainframe"
   - URL: github.com/company/cobol-legacy
   - Language: COBOL
   - Framework: CICS

3. Adds GitHub repository:
   - Name: "Current Java Backend"
   - URL: github.com/company/java-backend
   - Language: Java
   - Framework: Spring Boot 2

4. Skips Konveyor loading (no applicable rulesets)

5. Clicks "Analyze Application"

6. Tool fetches COBOL and Java source from GitHub

7. LLM analyzes:
   - COBOL programs (ORDPRC01.cbl, CUSTDB03.cbl, etc.)
   - Java services (OrderService.java, CustomerService.java, etc.)
   - Identifies duplicate business logic
   - Extracts business rules from both

8. Tool generates:
   - Business capabilities (consolidated from COBOL + Java)
   - Microservices decomposition
   - Technical debt analysis (VSAM → DB, CICS → REST)
   - Effort estimates (without Konveyor)

9. User exports Spec-Kits for each microservice

10. User uses Claude Code to implement in Quarkus
```

### Workflow 2: Multi-Repo E-Commerce App (With Konveyor)

```
1. User creates application: "E-Commerce Platform Modernization"

2. Adds 3 repositories:
   - Backend (Java/Spring Boot)
   - Frontend (React 16)
   - Admin (Django)

3. Loads 2 Konveyor reports:
   - Backend: J2EE → Quarkus analysis
   - Frontend: React 16 → React 19 analysis
   - Admin: No Konveyor (Django not supported)

4. Tool fetches all source code from GitHub

5. LLM analyzes all 3 repos together:
   - Finds duplicate discount logic in Backend + Frontend
   - Identifies shared entities (Order, Customer, Product)
   - Maps cross-repo workflows

6. Tool generates:
   - Unified business capabilities
   - 6 microservices (span repos)
   - Konveyor violations for Backend + Frontend
   - Technical debt analysis for Admin (without Konveyor)

7. Spec-Kits include:
   - Business logic from all 3 repos
   - Konveyor violations where available
   - Recommendations to centralize duplicate logic

8. User implements with AI coding agents
```

### Workflow 3: Quick Single-Repo Analysis

```
1. User wants simple analysis (like current tool)

2. Selects "Simple Mode"

3. Uploads single Kantra report OR enters single GitHub URL

4. Tool behaves like current version (no multi-repo complexity)

5. Generates decomposition and Spec-Kits

(Backward compatible with current workflow)
```

---

## Conclusion

This redesign transforms the tool from a Konveyor-dependent visualizer into a flexible, multi-source legacy application analyzer that:

1. **Supports Real-World Scenarios**: Multi-language, multi-repo applications
2. **Works Without Konveyor**: Direct source analysis when rules don't exist
3. **Identifies Duplication**: Cross-repo business logic consolidation
4. **Enables Language Transformation**: COBOL → Java, not just framework migrations
5. **Remains Simple**: Backward compatible with single-source workflow

The enhanced tool addresses the core problems identified and provides value for both Konveyor-supported migrations (J2EE → Quarkus) and language transformations (COBOL → Java).

**Next Steps**: Review this plan, provide feedback, and begin Phase 1 implementation.
