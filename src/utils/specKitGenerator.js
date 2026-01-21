/**
 * Spec-Kit Generator
 * Generates executable specifications following the GitHub Spec-Kit format
 * https://github.com/github/spec-kit
 */

// Helper to safely handle arrays
const safeArray = (arr) => arr || [];
const safeString = (str) => str || 'Not specified';

// Helper to format timestamp
const formatTimestamp = () => {
  return new Date().toISOString().split('T')[0];
};

// Helper to filter business logic for a specific service
export const filterBusinessLogicForService = (businessLogic, serviceName) => {
  return safeArray(businessLogic).filter(bl => bl.targetService === serviceName);
};

// Helper to get all violations for a service based on its components
export const getViolationsForService = (service, data) => {
  if (!data || !data.components || !service.components) {
    return [];
  }

  const violations = [];
  const serviceComponentNames = safeArray(service.components);

  // Find all components that belong to this service
  data.components.forEach(component => {
    if (serviceComponentNames.includes(component.name)) {
      safeArray(component.issues).forEach(issue => {
        violations.push({
          ...issue,
          componentName: component.name
        });
      });
    }
  });

  return violations;
};

// Helper to calculate total effort for violations
export const calculateTotalEffort = (violations) => {
  return violations.reduce((sum, v) => sum + (v.effort || 0), 0);
};

// Helper to group violations by severity
export const groupViolationsBySeverity = (violations) => {
  const groups = {
    critical: [],
    warning: [],
    info: []
  };

  violations.forEach(v => {
    const severity = v.severity || 'info';
    if (groups[severity]) {
      groups[severity].push(v);
    }
  });

  return groups;
};

/**
 * Generate constitution.md - Service development principles
 */
export const generateConstitution = (service, businessLogic, decomposition) => {
  const relevantBusinessLogic = filterBusinessLogicForService(businessLogic, service.name);

  let content = `# ${service.name} - Development Constitution

## Project Context
- **Service Name**: ${service.name}
- **Service Type**: ${safeString(service.type)}
- **Generated**: ${formatTimestamp()}

## Article I: Service Architecture Principles

### Core Responsibilities
${safeArray(service.responsibilities).map(resp => `- ${resp}`).join('\n')}

### Service Boundaries
- **Type**: ${safeString(service.type)}
- **Communication Pattern**: ${safeString(service.communication)}
- **Bounded Context**: Single responsibility, high cohesion, loose coupling

## Article II: Applied Architecture Patterns

${safeArray(service.patterns).length > 0 ? safeArray(service.patterns).map(pattern => `### ${pattern}
Implementation of ${pattern} to ensure resilience, scalability, and maintainability.
`).join('\n') : 'No specific patterns defined for this service.'}

## Article III: Business Logic Preservation

${relevantBusinessLogic.length > 0 ? `### Critical Business Logic
The following business capabilities must be preserved during migration:

${relevantBusinessLogic.map(bl => `#### ${bl.domain}
- **Description**: ${safeString(bl.description)}
- **Complexity**: ${safeString(bl.complexity)}
- **Critical Logic**: ${safeString(bl.criticalLogic)}
- **Source Components**: ${safeArray(bl.sourceComponents).join(', ')}
`).join('\n')}` : '*Note: This service may be an infrastructure or utility service with no explicit business logic mapping.*'}

## Article IV: Testing Requirements

### Test Coverage Standards
- **Unit Tests**: All business operations must have unit test coverage
- **Integration Tests**: ${service.communication} contracts must be tested
- **Contract Tests**: API boundaries must have contract tests
- **Performance Tests**: Service must meet SLA requirements

### Test-Driven Development
- Write tests before implementation
- Maintain >80% code coverage
- All tests must pass before deployment

## Article V: Data Management

${safeString(decomposition.dataStrategy)}

### Data Integrity
- Follow database-per-service pattern where applicable
- Ensure ACID properties for transactions
- Implement proper data validation

## Article VI: Kubernetes Deployment Standards

${safeArray(decomposition.kubernetesRecommendations).map(rec => `### ${rec.title}
${safeString(rec.description)}

**Implementation**: ${safeString(rec.implementation)}
`).join('\n')}

## Article VII: Code Quality Standards

### Code Review
- All changes require peer review
- Follow established coding standards
- Document complex business logic

### Security
- Input validation at all boundaries
- Secure credential management
- Regular security audits

### Performance
- Monitor service performance
- Optimize database queries
- Implement caching where appropriate
`;

  return content;
};

/**
 * Generate spec.md - Functional specification
 */
export const generateSpec = (service, businessLogic, decomposition, data) => {
  const relevantBusinessLogic = filterBusinessLogicForService(businessLogic, service.name);

  let content = `# ${service.name} - Functional Specification

## Overview
${safeString(service.description)}

**Service Type**: ${safeString(service.type)}

**Application Context**: ${data?.applicationName || 'Unknown Application'}

## Business Capabilities

${relevantBusinessLogic.length > 0 ? relevantBusinessLogic.map(bl => `### ${bl.domain}

**Description**: ${safeString(bl.description)}

**Complexity**: ${safeString(bl.complexity)}

#### Business Operations
${safeArray(bl.operations).length > 0 ? safeArray(bl.operations).map(op => `- ${op}`).join('\n') : 'No operations specified'}

#### Domain Entities
${safeArray(bl.entities).length > 0 ? safeArray(bl.entities).map(entity => `- ${entity}`).join('\n') : 'No entities specified'}

#### Business Rules & Validations
${safeArray(bl.rules).length > 0 ? safeArray(bl.rules).map(rule => `- ${rule}`).join('\n') : 'No rules specified'}

#### Critical Logic Requirements
${safeString(bl.criticalLogic)}

#### Source Components (Legacy Mapping)
${safeArray(bl.sourceComponents).map(comp => `- \`${comp}\``).join('\n')}
`).join('\n---\n\n') : `*This service may be an infrastructure or utility service. Business capabilities should be defined based on service responsibilities.*

### Service Responsibilities
${safeArray(service.responsibilities).map(resp => `- ${resp}`).join('\n')}`}

## Service Responsibilities
${safeArray(service.responsibilities).map(resp => `- ${resp}`).join('\n')}

## Component Migration Mapping

### Source Components (from Monolith)
${safeArray(service.components).map(comp => `- \`${comp}\``).join('\n')}

### Target Service
- **Service Name**: ${service.name}
- **Service Type**: ${safeString(service.type)}

## Communication Requirements

${safeString(service.communication)}

## Non-Functional Requirements

### Performance
- Response time targets based on ${service.type} service type
- Throughput requirements from legacy component analysis

### Scalability
- Horizontal scaling capability
- Kubernetes HPA configuration
- Resource limits and requests

### Reliability
- Service availability targets
- Fault tolerance mechanisms
- ${safeArray(service.patterns).filter(p => p.toLowerCase().includes('circuit')).length > 0 ? 'Circuit breaker for resilience' : 'Error handling and retry logic'}

### Security
- Authentication and authorization
- Data encryption in transit and at rest
- Compliance requirements

## Data Strategy
${safeString(decomposition.dataStrategy)}

## Migration Compliance Requirements

${(() => {
  const violations = getViolationsForService(service, data);

  if (violations.length === 0) {
    return '*No specific Konveyor rule violations identified for this service.*';
  }

  const bySeverity = groupViolationsBySeverity(violations);
  const totalEffort = calculateTotalEffort(violations);
  const uniqueRules = [...new Set(violations.map(v => v.ruleId))].filter(Boolean);

  let section = `This service must address **${violations.length} rule violations** from the Konveyor analysis (Total Effort: **${totalEffort} story points**).\n\n`;

  section += `### Affected Rules\n`;
  section += `${uniqueRules.map(ruleId => `- \`${ruleId}\``).join('\n')}\n\n`;

  if (bySeverity.critical.length > 0) {
    section += `### Critical Violations (${bySeverity.critical.length} issues, ${calculateTotalEffort(bySeverity.critical)} effort)\n\n`;
    bySeverity.critical.forEach(v => {
      section += `#### ${v.title}\n`;
      section += `- **Rule**: \`${v.ruleId}\`\n`;
      section += `- **Location**: \`${v.componentName}\` - ${v.location}\n`;
      section += `- **Effort**: ${v.effort} story points\n`;
      section += `- **Description**: ${safeString(v.description).split('\n')[0]}\n\n`;
    });
  }

  if (bySeverity.warning.length > 0) {
    section += `### Warning Violations (${bySeverity.warning.length} issues, ${calculateTotalEffort(bySeverity.warning)} effort)\n\n`;
    section += `${bySeverity.warning.map(v => `- **[${v.ruleId}]** ${v.title} (\`${v.componentName}\` - ${v.location}, Effort: ${v.effort})`).join('\n')}\n\n`;
  }

  if (bySeverity.info.length > 0) {
    section += `### Info Violations (${bySeverity.info.length} issues, ${calculateTotalEffort(bySeverity.info)} effort)\n\n`;
    section += `${bySeverity.info.map(v => `- **[${v.ruleId}]** ${v.title} (Effort: ${v.effort})`).join('\n')}\n\n`;
  }

  return section;
})()}

## Dependencies

### Internal Services
${safeArray(decomposition.microservices)
  .filter(s => s.name !== service.name)
  .map(s => `- ${s.name}`)
  .join('\n')}

### External Systems
- Legacy monolith (during migration phase)
- Shared databases (if applicable during transition)
`;

  return content;
};

/**
 * Generate plan.md - Technical implementation plan
 */
export const generatePlan = (service, businessLogic, decomposition, data) => {
  const relevantBusinessLogic = filterBusinessLogicForService(businessLogic, service.name);
  const migrationPhase = safeArray(decomposition.migrationStrategy)
    .find(phase => safeArray(phase.services).includes(service.name));
  const violations = getViolationsForService(service, data);
  const bySeverity = groupViolationsBySeverity(violations);
  const totalEffort = calculateTotalEffort(violations);

  let content = `# ${service.name} - Technical Implementation Plan

## Architecture Overview

**Service Type**: ${safeString(service.type)}

**Communication Pattern**: ${safeString(service.communication)}

**Description**: ${safeString(service.description)}

## Technical Debt Assessment

${violations.length > 0 ? `### Migration Violations Summary

This service has **${violations.length} Konveyor rule violations** that must be addressed during migration:

- **Critical Issues**: ${bySeverity.critical.length} (${calculateTotalEffort(bySeverity.critical)} effort points)
- **Warnings**: ${bySeverity.warning.length} (${calculateTotalEffort(bySeverity.warning)} effort points)
- **Info**: ${bySeverity.info.length} (${calculateTotalEffort(bySeverity.info)} effort points)
- **Total Migration Effort**: ${totalEffort} story points

### High-Priority Violations

${bySeverity.critical.slice(0, 5).map(v => `#### \`${v.ruleId}\` - ${v.title}
- **Component**: \`${v.componentName}\`
- **Location**: ${v.location}
- **Effort**: ${v.effort} points
- **Type**: ${v.type}
`).join('\n')}

${bySeverity.critical.length > 5 ? `*... and ${bySeverity.critical.length - 5} more critical violations. See spec.md for complete list.*\n` : ''}

### Effort Breakdown by Component

${(() => {
  const byComponent = {};
  violations.forEach(v => {
    if (!byComponent[v.componentName]) {
      byComponent[v.componentName] = { count: 0, effort: 0, violations: [] };
    }
    byComponent[v.componentName].count++;
    byComponent[v.componentName].effort += v.effort || 0;
    byComponent[v.componentName].violations.push(v);
  });

  return Object.entries(byComponent)
    .sort(([,a], [,b]) => b.effort - a.effort)
    .map(([comp, stats]) => `- **${comp}**: ${stats.count} violations, ${stats.effort} effort points`)
    .join('\n');
})()}
` : '*No Konveyor violations identified for this service.*'}

## Applied Architecture Patterns

${safeArray(service.patterns).map(pattern => `### ${pattern}

**Purpose**: ${pattern}

**Implementation Approach**:
- Apply this pattern to ensure ${pattern.toLowerCase().includes('circuit') ? 'resilience and fault tolerance' :
  pattern.toLowerCase().includes('saga') ? 'distributed transaction management' :
  pattern.toLowerCase().includes('gateway') ? 'centralized routing and security' :
  pattern.toLowerCase().includes('outbox') ? 'reliable event publishing' :
  'proper architecture and maintainability'}
`).join('\n')}

## Migration Strategy

${migrationPhase ? `### Phase ${migrationPhase.phase}: ${safeString(migrationPhase.title)}

${safeString(migrationPhase.description)}

**Services in this phase**: ${safeArray(migrationPhase.services).join(', ')}

**Migration patterns applied**: ${safeArray(migrationPhase.patterns).join(', ')}
` : '*Migration phase not explicitly defined for this service.*'}

### Component Migration Complexity

${relevantBusinessLogic.map(bl => `#### ${bl.domain}
- **Complexity**: ${safeString(bl.complexity)}
- **Source Components**: ${safeArray(bl.sourceComponents).join(', ')}
- **Critical Logic**: ${safeString(bl.criticalLogic)}
`).join('\n')}

## Kubernetes Deployment Strategy

### Deployment Type
${service.type === 'api' ? '**Deployment** - Stateless API service with rolling updates' :
  service.type === 'worker' ? '**Deployment** - Background worker with horizontal scaling' :
  service.type === 'data-service' ? '**StatefulSet** - Stateful data service with persistent storage' :
  service.type === 'gateway' ? '**Deployment** - API Gateway with load balancing' :
  '**Deployment** - Standard Kubernetes deployment'}

### Kubernetes Resources

${safeArray(decomposition.kubernetesRecommendations).map(rec => `#### ${rec.title}
${safeString(rec.description)}

**Implementation**:
\`\`\`
${safeString(rec.implementation)}
\`\`\`
`).join('\n')}

### Scaling Strategy
- **HPA**: Horizontal Pod Autoscaler based on CPU/memory metrics
- **Resource Limits**: Define appropriate CPU and memory limits
- **Replica Count**: ${service.type === 'gateway' ? 'Minimum 2 replicas for HA' : 'Scale based on load'}

## Data Management Implementation

${safeString(decomposition.dataStrategy)}

### Database Strategy
${relevantBusinessLogic.length > 0 ? `- **Pattern**: Database-per-service for autonomy
- **Migration**: Gradual data migration from shared database
- **Synchronization**: Use Change Data Capture (CDC) during transition` : '- May use shared cache or message queue depending on service type'}

### Entity Models
${relevantBusinessLogic.flatMap(bl => safeArray(bl.entities)).length > 0 ?
  relevantBusinessLogic.flatMap(bl => safeArray(bl.entities)).map(entity => `- ${entity}`).join('\n') :
  'No persistent entities - may be stateless service'}

## Communication Implementation

${safeString(service.communication)}

### API Design
- **Protocol**: ${service.type === 'api' ? 'REST or GraphQL' : 'gRPC or Message Queue'}
- **Authentication**: OAuth 2.0 or JWT
- **Rate Limiting**: Implement rate limiting for API protection

### Event-Driven Integration
${safeArray(service.patterns).filter(p => p.toLowerCase().includes('event') || p.toLowerCase().includes('outbox')).length > 0 ?
  '- Publish domain events for service integration\n- Use Outbox pattern for reliable event publishing\n- Subscribe to relevant events from other services' :
  '- Synchronous communication with other services\n- Consider async patterns for long-running operations'}

## Testing Strategy

### Unit Testing
- Test all business operations: ${relevantBusinessLogic.flatMap(bl => safeArray(bl.operations)).join(', ')}
- Mock external dependencies
- Achieve >80% code coverage

### Integration Testing
- Test ${service.communication} contracts
- Verify database interactions
- Test event publishing/consuming

### Performance Testing
- Load testing based on expected traffic
- Stress testing for peak scenarios
- Latency and throughput benchmarks

### Contract Testing
- Define API contracts
- Use Pact or similar for contract testing
- Ensure backward compatibility

## Security Implementation

### Authentication & Authorization
- Implement OAuth 2.0 or JWT-based auth
- Role-based access control (RBAC)
- Service-to-service authentication

### Data Security
- Encrypt sensitive data at rest
- TLS for all network communication
- Secrets management with Kubernetes Secrets or external vault

## Monitoring & Observability

### Metrics
- Service-level metrics (latency, throughput, errors)
- Business metrics from operations
- Resource utilization (CPU, memory, network)

### Logging
- Structured logging with correlation IDs
- Centralized log aggregation
- Log retention policies

### Tracing
- Distributed tracing across services
- Request flow visualization
- Performance bottleneck identification
`;

  return content;
};

/**
 * Generate tasks.md - Implementation task breakdown
 */
export const generateTasks = (service, businessLogic, decomposition, data) => {
  const relevantBusinessLogic = filterBusinessLogicForService(businessLogic, service.name);
  const migrationPhase = safeArray(decomposition.migrationStrategy)
    .find(phase => safeArray(phase.services).includes(service.name));
  const violations = getViolationsForService(service, data);
  const bySeverity = groupViolationsBySeverity(violations);

  let content = `# ${service.name} - Implementation Tasks

## Task Breakdown

### Phase 1: Project Setup & Infrastructure

- [ ] Create service project structure
- [ ] Configure build system (Maven/Gradle/npm)
- [ ] Setup testing framework
- [ ] Configure linting and code quality tools
- [ ] Initialize Git repository
- [ ] Setup CI/CD pipeline
- [ ] Create Kubernetes manifests (Deployment, Service, ConfigMap, Secrets)
- [ ] Configure development environment

### Phase 2: Fix Konveyor Migration Violations

${violations.length > 0 ? `**Total Violations**: ${violations.length} issues | **Total Effort**: ${calculateTotalEffort(violations)} story points

${bySeverity.critical.length > 0 ? `#### Critical Violations (${bySeverity.critical.length} issues, ${calculateTotalEffort(bySeverity.critical)} effort)

${bySeverity.critical.map(v => `- [ ] **[${v.ruleId}]** ${v.title}
  - **Component**: \`${v.componentName}\`
  - **Location**: ${v.location}
  - **Effort**: ${v.effort} points
  - **Fix**: ${safeString(v.description).split('\n')[0].substring(0, 200)}...
`).join('\n')}` : ''}

${bySeverity.warning.length > 0 ? `#### Warning Violations (${bySeverity.warning.length} issues, ${calculateTotalEffort(bySeverity.warning)} effort)

${bySeverity.warning.map(v => `- [ ] **[${v.ruleId}]** ${v.title} (\`${v.componentName}\`, ${v.location}, Effort: ${v.effort})`).join('\n')}
` : ''}

${bySeverity.info.length > 0 ? `#### Info Violations (${bySeverity.info.length} issues, ${calculateTotalEffort(bySeverity.info)} effort)

${bySeverity.info.map(v => `- [ ] **[${v.ruleId}]** ${v.title} (Effort: ${v.effort})`).join('\n')}
` : ''}` : '*No Konveyor violations to fix for this service.*'}

### Phase 3: Business Logic Migration

${relevantBusinessLogic.length > 0 ? relevantBusinessLogic.map(bl => `#### Domain: ${bl.domain}

**Complexity**: ${safeString(bl.complexity)} | **Source**: ${safeArray(bl.sourceComponents).join(', ')}

**Business Operations**:
${safeArray(bl.operations).map(op => `- [ ] Implement: ${op}`).join('\n')}

**Entity Models**:
${safeArray(bl.entities).map(entity => `- [ ] Create entity: ${entity}
- [ ] Create repository/DAO for ${entity}
- [ ] Implement validation for ${entity}`).join('\n')}

**Business Rules & Validations**:
${safeArray(bl.rules).map(rule => `- [ ] Implement validation: ${rule}`).join('\n')}

**Critical Logic**:
- [ ] Preserve critical logic: ${safeString(bl.criticalLogic)}
- [ ] Write tests for critical logic paths
- [ ] Validate against legacy behavior

---
`).join('\n') : `*No explicit business logic mapping. Implement based on service responsibilities.*

${safeArray(service.responsibilities).map(resp => `- [ ] Implement: ${resp}`).join('\n')}

---
`}

### Phase 4: Service Responsibilities

${safeArray(service.responsibilities).map(resp => `- [ ] Implement responsibility: ${resp}`).join('\n')}

### Phase 5: Architecture Pattern Implementation

${safeArray(service.patterns).map(pattern => `- [ ] Implement ${pattern}
- [ ] Write tests for ${pattern} behavior
- [ ] Document ${pattern} usage`).join('\n')}

### Phase 6: Communication Layer

- [ ] Define API contracts (OpenAPI/gRPC proto)
- [ ] Implement ${service.communication}
- [ ] Create client libraries/SDKs
- [ ] Implement request/response validation
- [ ] Add rate limiting and throttling
- [ ] Configure CORS policies (if applicable)
${safeArray(service.patterns).filter(p => p.toLowerCase().includes('event')).length > 0 ? `- [ ] Setup event publishing
- [ ] Setup event consumption
- [ ] Implement event schema validation` : ''}

### Phase 7: Data Layer Implementation

${relevantBusinessLogic.flatMap(bl => safeArray(bl.entities)).length > 0 ? `- [ ] Setup database (PostgreSQL/MySQL/MongoDB)
- [ ] Create database migrations
- [ ] Implement entity repositories
${relevantBusinessLogic.flatMap(bl => safeArray(bl.entities)).map(entity => `- [ ] Repository for ${entity}`).join('\n')}
- [ ] Implement data access layer
- [ ] Add database connection pooling
- [ ] Configure read/write splitting (if needed)
- [ ] Setup database backup strategy` : `- [ ] Configure data storage (if needed)
- [ ] Setup caching layer (Redis/Memcached)
- [ ] Implement data persistence strategy`}

### Phase 8: Kubernetes Deployment

${safeArray(decomposition.kubernetesRecommendations).map(rec => `- [ ] ${rec.title}
  - Implementation: ${safeString(rec.implementation)}`).join('\n')}

- [ ] Create Deployment manifest
- [ ] Configure Service (ClusterIP/LoadBalancer)
- [ ] Setup ConfigMaps for configuration
- [ ] Setup Secrets for sensitive data
- [ ] Configure health checks (liveness/readiness/startup probes)
- [ ] Define resource limits and requests
- [ ] Setup HPA (Horizontal Pod Autoscaler)
${service.type === 'data-service' ? `- [ ] Configure PersistentVolumeClaims
- [ ] Setup StatefulSet for data persistence` : ''}

### Phase 9: Security Implementation

- [ ] Implement authentication mechanism
- [ ] Setup authorization (RBAC)
- [ ] Configure TLS/SSL certificates
- [ ] Implement input validation
- [ ] Add SQL injection prevention
- [ ] Setup secrets management
- [ ] Implement audit logging
- [ ] Conduct security scan

### Phase 10: Testing & Quality Assurance

**Unit Tests**:
${relevantBusinessLogic.flatMap(bl => safeArray(bl.operations)).map(op => `- [ ] Unit test for: ${op}`).join('\n')}
- [ ] Achieve >80% code coverage

**Integration Tests**:
- [ ] Test database interactions
- [ ] Test ${service.communication} contracts
- [ ] Test external service integrations
- [ ] Test event publishing/consuming

**Performance Tests**:
- [ ] Load testing
- [ ] Stress testing
- [ ] Latency benchmarks
- [ ] Resource usage profiling

**Contract Tests**:
- [ ] Define API contracts
- [ ] Implement contract tests (Pact/Spring Cloud Contract)
- [ ] Verify backward compatibility

### Phase 11: Monitoring & Observability

- [ ] Implement metrics collection (Prometheus)
- [ ] Setup structured logging
- [ ] Configure distributed tracing (Jaeger/Zipkin)
- [ ] Create service dashboards (Grafana)
- [ ] Setup alerts for critical metrics
- [ ] Implement health check endpoints
- [ ] Add correlation IDs to requests

### Phase 12: Migration & Cutover

${migrationPhase ? `**Migration Phase**: ${migrationPhase.phase} - ${safeString(migrationPhase.title)}

${safeString(migrationPhase.description)}

**Migration Tasks**:
- [ ] Deploy to staging environment
- [ ] Parallel run with legacy monolith
- [ ] Setup traffic shadowing/mirroring
- [ ] Gradual traffic shift (canary deployment)
- [ ] Monitor error rates and performance
- [ ] Rollback plan preparation
- [ ] Data migration from monolith
- [ ] Validate business operations in production
- [ ] Decommission monolith components: ${safeArray(service.components).join(', ')}
- [ ] Archive legacy code
` : `- [ ] Deploy to staging environment
- [ ] Integration testing with other services
- [ ] Production deployment
- [ ] Monitor initial rollout
- [ ] Gradual traffic increase
`}

### Phase 13: Documentation & Handoff

- [ ] Write API documentation
- [ ] Document architecture decisions
- [ ] Create runbook for operations
- [ ] Document troubleshooting guides
- [ ] Create onboarding guide for developers
- [ ] Document deployment procedures
- [ ] Knowledge transfer to operations team

## Dependencies

${migrationPhase ? `**Migration Phase**: ${migrationPhase.phase}

**Prerequisites**: ${migrationPhase.phase > 1 ? 'Previous migration phases must be completed' : 'Initial infrastructure setup'}

**Parallel Services**: ${safeArray(migrationPhase.services).filter(s => s !== service.name).join(', ') || 'None'}
` : ''}

**Technical Dependencies**:
- Kubernetes cluster availability
- Database provisioning
- CI/CD pipeline setup
- Monitoring infrastructure

## Success Criteria

- [ ] All business operations are functional
- [ ] All critical business logic is preserved
${violations.length > 0 ? `- [ ] All ${violations.length} Konveyor rule violations fixed (${calculateTotalEffort(violations)} effort points)` : ''}
- [ ] All tests passing (unit, integration, contract)
- [ ] Performance meets SLA requirements
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Production deployment successful
- [ ] Zero data loss during migration
- [ ] Service availability >99.9%
`;

  return content;
};

/**
 * Main function to generate all Spec-Kit files for a service
 */
export const generateAllSpecKitFiles = (service, businessLogic, decomposition, data) => {
  return {
    constitution: generateConstitution(service, businessLogic, decomposition),
    spec: generateSpec(service, businessLogic, decomposition, data),
    plan: generatePlan(service, businessLogic, decomposition, data),
    tasks: generateTasks(service, businessLogic, decomposition, data)
  };
};
