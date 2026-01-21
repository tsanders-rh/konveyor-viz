import {
  Card,
  CardTitle,
  CardBody,
  Button,
  Spinner,
  Alert,
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  Title,
  Grid,
  GridItem,
  Label,
  List,
  ListItem
} from '@patternfly/react-core';
import { CubesIcon, DownloadIcon, SyncAltIcon } from '@patternfly/react-icons';
import llmService from '../../services/llmService';
import { getActiveProvider, LLM_PROVIDERS } from '../../config/llmConfig';
import MicroservicesTierDiagram from './MicroservicesTierDiagram';
import BusinessLogicDocumentation from './BusinessLogicDocumentation';
import SpecKitExportButton from './SpecKitExportButton';
import JSZip from 'jszip';
import { generateAllSpecKitFiles } from '../../utils/specKitGenerator';
import { sanitizeFilename, downloadZip } from '../../utils/downloadUtils';

const MicroservicesDecomposition = ({
  data,
  decomposition,
  setDecomposition,
  loading,
  setLoading,
  error,
  setError
}) => {
  const activeProvider = getActiveProvider();

  // Detect if app is already well-architected
  const isAlreadyDecomposed = () => {
    if (!data || !data.components) return false;

    const componentCount = data.components.length;
    const totalIssues = data.summary.totalIssues;

    // Check if it's a frontend-only app (no backend layers)
    const hasBackendLayers = data.components.some(c =>
      ['service', 'rest', 'persistence', 'model'].includes(c.id)
    );

    // Check if one component dominates (has 70%+ of issues)
    const largestComponentIssues = Math.max(...data.components.map(c => c.issues.length));
    const isDominated = largestComponentIssues / totalIssues > 0.7;

    // Already decomposed if:
    // - Small number of well-balanced components (2-6)
    // - OR frontend-only app with few components
    // - AND no single component dominates
    const isBalanced = componentCount >= 2 && componentCount <= 6 && !isDominated;
    const isFrontendOnly = !hasBackendLayers && componentCount <= 5;

    return isBalanced || isFrontendOnly;
  };

  const generateDecomposition = async () => {
    if (activeProvider === LLM_PROVIDERS.NONE) {
      setError('AI provider required for microservices decomposition. Please configure an API key.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await llmService.generateMicroservicesDecomposition(data);
      if (result) {
        setDecomposition(result);
      } else {
        setError('Failed to generate decomposition. Please try again.');
      }
    } catch (err) {
      console.error('Decomposition error:', err);
      setError(err.message || 'Failed to generate decomposition');
    } finally {
      setLoading(false);
    }
  };

  const exportAllSpecKits = async () => {
    if (!decomposition || !decomposition.microservices) {
      alert('No microservices to export');
      return;
    }

    // Warn for large exports
    if (decomposition.microservices.length > 10) {
      const confirmed = confirm(
        `You are about to export ${decomposition.microservices.length} services. This may take a moment. Continue?`
      );
      if (!confirmed) return;
    }

    try {
      const allServicesZip = new JSZip();

      // Create a folder for each service
      for (const service of decomposition.microservices) {
        const files = generateAllSpecKitFiles(
          service,
          decomposition.businessLogic || [],
          decomposition,
          data
        );

        const serviceFolderName = sanitizeFilename(service.name);
        const serviceFolder = allServicesZip.folder(serviceFolderName);

        // Add files to service folder
        serviceFolder.file('constitution.md', files.constitution);
        serviceFolder.file('spec.md', files.spec);
        serviceFolder.file('plan.md', files.plan);
        serviceFolder.file('tasks.md', files.tasks);

        // Add service-specific README
        const serviceReadme = `# ${service.name} - Spec-Kit

Type: ${service.type}

${service.description}

See parent README for usage instructions.
`;
        serviceFolder.file('README.md', serviceReadme);
      }

      // Add root README
      const rootReadme = `# ${data.applicationName} - Microservices Spec-Kits

This archive contains Spec-Kit specifications for all proposed microservices in the ${data.applicationName} modernization project.

## Services

${decomposition.microservices.map(s => `- **${s.name}** (${s.type}) - ${s.description}`).join('\n')}

## Structure

Each service folder contains:
- constitution.md - Development principles
- spec.md - Functional specification
- plan.md - Technical implementation plan
- tasks.md - Task breakdown
- README.md - Service-specific guide

## Usage

1. Extract this archive to your workspace
2. Review each service specification
3. Customize for your technology stack
4. Use with AI coding agents (Claude Code, Copilot, etc.)
5. Begin implementation following the task breakdown

## Spec-Kit Format

These specifications follow the [GitHub Spec-Kit](https://github.com/github/spec-kit) format for spec-driven development with AI.

---

Generated by Konveyor Visual Analysis Tool on ${new Date().toISOString().split('T')[0]}
`;

      allServicesZip.file('README.md', rootReadme);

      // Generate ZIP blob
      const blob = await allServicesZip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      // Download
      const filename = `${sanitizeFilename(data.applicationName)}-all-spec-kits-${new Date().toISOString().split('T')[0]}.zip`;
      downloadZip(blob, filename);
    } catch (error) {
      console.error('Export all failed:', error);
      alert('Failed to export Spec-Kits. Please try again.');
    }
  };

  const alreadyDecomposed = isAlreadyDecomposed();

  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h2" size="xl">
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CubesIcon />
            <span>Microservices Decomposition Strategy</span>
          </span>
        </Title>
      </CardTitle>
      <CardBody>
        <div style={{ marginBottom: '16px', color: '#6a6e73' }}>
          {alreadyDecomposed
            ? 'AI-powered modernization strategy analysis for your well-architected application.'
            : 'AI-powered analysis using Kubernetes best practices to suggest how to break down your monolith into microservices.'
          }
        </div>

        {!decomposition && !loading && alreadyDecomposed && (
          <Alert variant="success" isInline title="Well-Architected Application Detected" style={{ marginBottom: '16px' }}>
            Your application appears to already have a well-balanced component architecture.
            AI analysis will focus on cloud-native modernization strategies rather than decomposition.
          </Alert>
        )}

        {!decomposition && !loading && (
          <EmptyState titleText={alreadyDecomposed ? "Ready to Analyze Modernization Strategy?" : "Ready to Modernize Your Architecture?"} icon={CubesIcon} headingLevel="h3">
            <EmptyStateBody>
              {alreadyDecomposed
                ? 'Generate a modernization strategy based on your application\'s current architecture, focusing on cloud-native patterns and Kubernetes best practices.'
                : 'Generate a microservices decomposition strategy based on your application\'s current architecture, dependencies, and Kubernetes best practices.'
              }
            </EmptyStateBody>
            <EmptyStateActions>
              <Button
                variant="primary"
                onClick={generateDecomposition}
                isDisabled={activeProvider === LLM_PROVIDERS.NONE}
                style={{ marginTop: '1.5rem' }}
              >
                {activeProvider === LLM_PROVIDERS.NONE ? 'Configure AI Provider First' : (alreadyDecomposed ? 'Generate Modernization Strategy' : 'Generate Microservices Strategy')}
              </Button>
            </EmptyStateActions>
          </EmptyState>
        )}

        {loading && (
          <EmptyState titleText="Analyzing architecture..." icon={Spinner} headingLevel="h3">
            <EmptyStateBody>
              Generating microservices strategy... This may take 15-30 seconds
            </EmptyStateBody>
          </EmptyState>
        )}

        {error && (
          <Alert variant="danger" isInline title="Error">
            {error}
          </Alert>
        )}

        {decomposition && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Strategy Overview */}
            {decomposition.overview && (
              <Alert variant="info" isInline title="📋 Strategy Overview">
                {decomposition.overview}
              </Alert>
            )}

            {/* Business Logic Documentation */}
            {decomposition.businessLogic && decomposition.businessLogic.length > 0 && (
              <BusinessLogicDocumentation businessLogic={decomposition.businessLogic} />
            )}

            {/* Tiered Architecture Diagram */}
            {decomposition.microservices && decomposition.microservices.length > 0 && (
              <MicroservicesTierDiagram microservices={decomposition.microservices} />
            )}

            {/* Proposed Microservices */}
            {decomposition.microservices && decomposition.microservices.length > 0 && (
              <div>
                <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
                  🔨 Proposed Microservices
                </Title>
                <Grid hasGutter>
                  {decomposition.microservices.map((service, idx) => (
                    <GridItem key={idx} md={6}>
                      <Card isCompact>
                        <CardTitle>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ fontWeight: '600' }}>
                              {service.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Label color="green" isCompact>
                                {service.type || 'Service'}
                              </Label>
                              <SpecKitExportButton
                                service={service}
                                businessLogic={decomposition.businessLogic}
                                decomposition={decomposition}
                                data={data}
                              />
                            </div>
                          </div>
                        </CardTitle>
                        <CardBody>
                          <div style={{ fontSize: '0.875rem', color: '#6a6e73', marginBottom: '16px' }}>
                            {service.description}
                          </div>

                          {service.components && service.components.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px', color: '#6a6e73' }}>
                                Components:
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {service.components.map((comp, i) => (
                                  <Label key={i} isCompact>
                                    {comp}
                                  </Label>
                                ))}
                              </div>
                            </div>
                          )}

                          {service.responsibilities && service.responsibilities.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px', color: '#6a6e73' }}>
                                Responsibilities:
                              </div>
                              <List isPlain>
                                {service.responsibilities.slice(0, 3).map((resp, i) => (
                                  <ListItem key={i} style={{ fontSize: '0.75rem' }}>
                                    • {resp}
                                  </ListItem>
                                ))}
                              </List>
                            </div>
                          )}

                          {service.patterns && service.patterns.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px', color: '#6a6e73' }}>
                                Patterns Applied:
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {service.patterns.map((pattern, i) => (
                                  <Label key={i} color="blue" isCompact>
                                    🏛️ {pattern}
                                  </Label>
                                ))}
                              </div>
                            </div>
                          )}

                          {service.communication && (
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px', color: '#6a6e73' }}>
                                Communication:
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#6a6e73' }}>
                                {service.communication}
                              </div>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    </GridItem>
                  ))}
                </Grid>
              </div>
            )}

            {/* Migration Strategy */}
            {decomposition.migrationStrategy && decomposition.migrationStrategy.length > 0 && (
              <div>
                <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
                  🚀 Migration Strategy
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {decomposition.migrationStrategy.map((phase, idx) => (
                    <Card key={idx} isCompact style={{ borderLeft: '4px solid var(--pf-v5-global--palette--purple-500)' }}>
                      <CardBody>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                          <Label color="purple" isCompact>
                            Phase {phase.phase || idx + 1}
                          </Label>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                              {phase.title}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6a6e73', marginBottom: '8px' }}>
                              {phase.description}
                            </div>
                            {phase.patterns && phase.patterns.length > 0 && (
                              <div style={{ marginBottom: '8px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: '#6a6e73' }}>
                                  Patterns:
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {phase.patterns.map((pattern, i) => (
                                    <Label key={i} color="blue" isCompact>
                                      📐 {pattern}
                                    </Label>
                                  ))}
                                </div>
                              </div>
                            )}
                            {phase.services && phase.services.length > 0 && (
                              <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', color: '#6a6e73' }}>
                                  Services:
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {phase.services.map((svc, i) => (
                                    <Label key={i} color="purple" isCompact>
                                      {svc}
                                    </Label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Kubernetes Recommendations */}
            {decomposition.kubernetesRecommendations && decomposition.kubernetesRecommendations.length > 0 && (
              <div>
                <Title headingLevel="h3" size="lg" style={{ marginBottom: '16px' }}>
                  ☸️ Kubernetes Best Practices
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {decomposition.kubernetesRecommendations.map((rec, idx) => (
                    <Card key={idx} isCompact>
                      <CardTitle>{rec.title}</CardTitle>
                      <CardBody>
                        <div style={{ fontSize: '0.875rem', color: '#6a6e73', marginBottom: '8px' }}>
                          {rec.description}
                        </div>
                        {rec.implementation && (
                          <Card isFlat isCompact>
                            <CardBody>
                              <code style={{ fontSize: '0.75rem' }}>
                                {rec.implementation}
                              </code>
                            </CardBody>
                          </Card>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Data Considerations */}
            {decomposition.dataStrategy && (
              <Alert variant="warning" isInline title="💾 Data Management Strategy">
                {decomposition.dataStrategy.split('. ').map((sentence, idx) => {
                  if (!sentence.trim()) return null;
                  const text = sentence.trim() + (sentence.endsWith('.') ? '' : '.');
                  return <div key={idx} style={{ marginBottom: '8px' }}>{text}</div>;
                })}
              </Alert>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--pf-v5-global--BorderColor--100)' }}>
              <Button
                variant="secondary"
                onClick={generateDecomposition}
                icon={<SyncAltIcon />}
              >
                Regenerate Strategy
              </Button>
              <Button
                variant="primary"
                onClick={exportAllSpecKits}
                icon={<DownloadIcon />}
              >
                Download All Spec-Kits
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default MicroservicesDecomposition;
