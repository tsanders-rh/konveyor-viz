import { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Card, CardTitle, CardBody, Title } from '@patternfly/react-core';
import { getNodeColor } from '../../utils/colorUtils';

const ArchitectureGraph = ({ data, onNodeClick }) => {
  const fgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    // Update dimensions based on container
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.max(700, window.innerHeight - 300);
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    // Auto-fit graph after data loads with more padding to ensure labels are visible
    if (fgRef.current && data.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 80);
      }, 100);
    }
  }, [data]);

  const handleNodeClick = (node) => {
    if (onNodeClick && node.fullData) {
      onNodeClick(node.fullData);
    }
  };

  // Get icon for component type
  const getTypeIcon = (type) => {
    const icons = {
      frontend: '🌐',
      backend: '⚙️',
      middleware: '🔌',
      data: '💾',
      infrastructure: '🔧'
    };
    return icons[type] || '📦';
  };

  // Custom node rendering with labels
  const nodeCanvasObject = (node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    const iconSize = 16 / globalScale;
    const nodeRadius = Math.sqrt(Math.max(1, node.linesOfCode / 5000)) * 8;

    // Draw node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = getNodeColor(node.issues);
    ctx.fill();

    // Draw icon in the center of the node
    ctx.font = `${iconSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(getTypeIcon(node.type), node.x, node.y);

    // Prepare label text
    const labelY = node.y + nodeRadius + fontSize * 1.5;
    const issueLabelY = node.y + nodeRadius + fontSize * 2.8;

    // Draw white background for label (to prevent overlap issues)
    ctx.font = `${fontSize}px Sans-Serif`;
    const labelWidth = ctx.measureText(label).width;
    const issueText = `${node.issues} issues`;
    const issueWidth = ctx.measureText(issueText).width;
    const maxWidth = Math.max(labelWidth, issueWidth);

    ctx.fillStyle = 'rgba(249, 250, 251, 0.95)'; // Match background with slight transparency
    ctx.fillRect(
      node.x - maxWidth / 2 - 4,
      labelY - fontSize / 2 - 2,
      maxWidth + 8,
      fontSize * 2.5
    );

    // Draw label text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1f2937';
    ctx.fillText(label, node.x, labelY);

    // Draw issue count
    ctx.fillStyle = '#6b7280';
    ctx.fillText(issueText, node.x, issueLabelY);
  };

  return (
    <Card isRounded style={{ boxShadow: 'var(--pf-v5-global--BoxShadow--sm)' }}>
      <CardTitle>
        <Title headingLevel="h2" size="xl" style={{ fontWeight: 'var(--pf-v5-global--FontWeight--bold)' }}>
          Application Architecture
        </Title>
      </CardTitle>
      <CardBody>
        <div ref={containerRef} style={{ position: 'relative', backgroundColor: 'var(--pf-v5-global--BackgroundColor--200)', borderRadius: 'var(--pf-v5-global--BorderRadius--sm)' }}>
        {data.nodes && data.nodes.length > 0 ? (
          <ForceGraph2D
            ref={fgRef}
            graphData={data}
            width={dimensions.width - 32}
            height={dimensions.height}
            nodeLabel={(node) => `${node.name}\n${node.issues} issues\n${node.linesOfCode.toLocaleString()} LOC`}
            nodeCanvasObject={nodeCanvasObject}
            nodeVal={(node) => Math.max(1, node.linesOfCode / 5000)}
            onNodeClick={handleNodeClick}
            linkColor={() => '#9ca3af'}
            linkWidth={1.5}
            linkLineDash={(link) => link.type === 'build' ? [2, 3] : []}
            linkDirectionalArrowLength={3}
            linkDirectionalArrowRelPos={1}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            cooldownTime={3000}
            d3Force={{
              charge: { strength: -1000 },
              link: { distance: 180 },
              collision: { radius: 100 }  // Large radius to account for labels below nodes
            }}
            enableNodeDrag={true}
            onEngineStop={() => fgRef.current?.zoomToFit(400, 80)}
            enableZoomInteraction={true}
            enablePanInteraction={true}
            backgroundColor="#f9fafb"
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--pf-v5-global--Color--200)',
              height: dimensions.height
            }}
          >
            No graph data available
          </div>
        )}
        </div>

        {/* Legends */}
        <div style={{ marginTop: 'var(--pf-v5-global--spacer--md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--sm)' }}>
          {/* Color Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--lg)', fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
            <span style={{ color: 'var(--pf-v5-global--Color--200)', fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)', marginRight: 'var(--pf-v5-global--spacer--xs)' }}>Issue Severity:</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{ width: '16px', height: '16px', borderRadius: '50%', marginRight: 'var(--pf-v5-global--spacer--xs)', backgroundColor: '#ff6b6b' }}
              ></div>
              <span style={{ color: 'var(--pf-v5-global--Color--100)' }}>&gt;20 issues</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{ width: '16px', height: '16px', borderRadius: '50%', marginRight: 'var(--pf-v5-global--spacer--xs)', backgroundColor: '#ffd93d' }}
              ></div>
              <span style={{ color: 'var(--pf-v5-global--Color--100)' }}>5-20 issues</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{ width: '16px', height: '16px', borderRadius: '50%', marginRight: 'var(--pf-v5-global--spacer--xs)', backgroundColor: '#95e1d3' }}
              ></div>
              <span style={{ color: 'var(--pf-v5-global--Color--100)' }}>&lt;5 issues</span>
            </div>
          </div>

          {/* Icon Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--lg)', fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
            <span style={{ color: 'var(--pf-v5-global--Color--200)', fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)', marginRight: 'var(--pf-v5-global--spacer--xs)' }}>Component Type:</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 'var(--pf-v5-global--spacer--xs)' }}>🌐</span>
              <span style={{ color: 'var(--pf-v5-global--Color--100)' }}>Frontend</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 'var(--pf-v5-global--spacer--xs)' }}>⚙️</span>
              <span style={{ color: 'var(--pf-v5-global--Color--100)' }}>Backend</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 'var(--pf-v5-global--spacer--xs)' }}>🔌</span>
              <span style={{ color: 'var(--pf-v5-global--Color--100)' }}>Middleware</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 'var(--pf-v5-global--spacer--xs)' }}>🔧</span>
              <span style={{ color: 'var(--pf-v5-global--Color--100)' }}>Infrastructure</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ArchitectureGraph;
