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

  // Draw icon based on component type (matching SVG legend)
  const drawTypeIcon = (ctx, x, y, type, size) => {
    // Scale factor to match SVG viewBox (24x24 with 12 center)
    const scale = size / 12;

    switch(type) {
      case 'frontend':
        // Globe icon - circle with cross lines (matching SVG)
        ctx.save();
        ctx.strokeStyle = '#151515';
        ctx.lineWidth = 0.7;
        ctx.fillStyle = 'transparent';

        ctx.beginPath();
        ctx.arc(x, y, 8 * scale, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y - 8 * scale);
        ctx.lineTo(x, y + 8 * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x - 8 * scale, y);
        ctx.lineTo(x + 8 * scale, y);
        ctx.stroke();
        ctx.restore();
        break;

      case 'backend':
        // Server/layers icon - stacked rectangles (matching SVG)
        ctx.save();
        ctx.fillStyle = '#151515';
        const rectWidth = 14 * scale;
        const rectHeight = 2.5 * scale;
        ctx.fillRect(x - rectWidth/2, y - 5 * scale, rectWidth, rectHeight);
        ctx.fillRect(x - rectWidth/2, y - 1 * scale, rectWidth, rectHeight);
        ctx.fillRect(x - rectWidth/2, y + 3 * scale, rectWidth, rectHeight);
        ctx.restore();
        break;

      case 'middleware':
        // Diamond icon (matching SVG) - STROKE ONLY, NO FILL
        ctx.save();
        ctx.strokeStyle = '#151515';
        ctx.lineWidth = 0.7;
        ctx.fillStyle = 'transparent';

        ctx.beginPath();
        ctx.moveTo(x, y - 8 * scale);
        ctx.lineTo(x + 8 * scale, y);
        ctx.lineTo(x, y + 8 * scale);
        ctx.lineTo(x - 8 * scale, y);
        ctx.lineTo(x, y - 8 * scale);
        ctx.stroke();
        ctx.restore();
        break;

      case 'data':
        // Database cylinder icon (matching SVG)
        ctx.save();
        ctx.strokeStyle = '#151515';
        ctx.lineWidth = 0.7;
        ctx.fillStyle = 'transparent';

        ctx.beginPath();
        ctx.ellipse(x, y - 4 * scale, 6 * scale, 2.5 * scale, 0, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x - 6 * scale, y - 4 * scale);
        ctx.lineTo(x - 6 * scale, y + 4 * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + 6 * scale, y - 4 * scale);
        ctx.lineTo(x + 6 * scale, y + 4 * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(x, y + 4 * scale, 6 * scale, 2.5 * scale, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
        break;

      case 'infrastructure':
        // 3D Cube icon (matching SVG) - STROKE ONLY
        ctx.save();
        ctx.strokeStyle = '#151515';
        ctx.lineWidth = 0.7;
        ctx.fillStyle = 'transparent';

        // Front face
        ctx.beginPath();
        ctx.moveTo(x - 4 * scale, y - 2 * scale);
        ctx.lineTo(x + 4 * scale, y - 2 * scale);
        ctx.lineTo(x + 4 * scale, y + 6 * scale);
        ctx.lineTo(x - 4 * scale, y + 6 * scale);
        ctx.lineTo(x - 4 * scale, y - 2 * scale);
        ctx.stroke();

        // Top face
        ctx.beginPath();
        ctx.moveTo(x - 4 * scale, y - 2 * scale);
        ctx.lineTo(x, y - 6 * scale);
        ctx.lineTo(x + 8 * scale, y - 6 * scale);
        ctx.lineTo(x + 4 * scale, y - 2 * scale);
        ctx.stroke();

        // Side face
        ctx.beginPath();
        ctx.moveTo(x + 4 * scale, y - 2 * scale);
        ctx.lineTo(x + 8 * scale, y - 6 * scale);
        ctx.lineTo(x + 8 * scale, y + 2 * scale);
        ctx.lineTo(x + 4 * scale, y + 6 * scale);
        ctx.stroke();
        ctx.restore();
        break;

      default:
        // Generic component icon - simple square with corner
        ctx.save();
        ctx.strokeStyle = '#151515';
        ctx.lineWidth = 0.7;
        ctx.fillStyle = '#151515';

        ctx.strokeRect(x - 6 * scale, y - 6 * scale, 12 * scale, 12 * scale);
        ctx.beginPath();
        ctx.moveTo(x + 6 * scale, y - 6 * scale);
        ctx.lineTo(x + 2 * scale, y - 6 * scale);
        ctx.lineTo(x + 6 * scale, y - 2 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
  };

  // Custom node rendering with labels
  const nodeCanvasObject = (node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    const nodeRadius = Math.sqrt(Math.max(1, node.linesOfCode / 5000)) * 8;
    const borderWidth = 3 / globalScale;
    const iconSize = 12 / globalScale;

    // Draw white background circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Draw colored border ring
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
    ctx.strokeStyle = getNodeColor(node.issues);
    ctx.lineWidth = borderWidth;
    ctx.stroke();

    // Draw type icon in the center of the node
    drawTypeIcon(ctx, node.x, node.y, node.type, iconSize);

    // Prepare label text
    const labelY = node.y + nodeRadius + fontSize * 1.5;
    const issueLabelY = node.y + nodeRadius + fontSize * 2.8;

    // Draw white background for label (to prevent overlap issues)
    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    const labelWidth = ctx.measureText(label).width;
    const issueText = `${node.issues} issues`;
    const issueWidth = ctx.measureText(issueText).width;
    const maxWidth = Math.max(labelWidth, issueWidth);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(
      node.x - maxWidth / 2 - 4,
      labelY - fontSize / 2 - 2,
      maxWidth + 8,
      fontSize * 2.5
    );

    // Draw label text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#151515';
    ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(label, node.x, labelY);

    // Draw issue count
    ctx.fillStyle = '#6a6e73';
    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(issueText, node.x, issueLabelY);
  };

  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h2" size="lg">
          Application Architecture
        </Title>
      </CardTitle>
      <CardBody>
        <div ref={containerRef} style={{ position: 'relative', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #d2d2d2' }}>
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
            backgroundColor="#ffffff"
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6a6e73',
              height: dimensions.height
            }}
          >
            No graph data available
          </div>
        )}
        </div>

        {/* Legends */}
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {/* Color Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '0.875rem' }}>
            <span style={{ color: '#6a6e73', fontWeight: '600', marginRight: '4px' }}>Issue Severity:</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{ width: '16px', height: '16px', borderRadius: '50%', marginRight: '4px', backgroundColor: '#c9190b' }}
              ></div>
              <span style={{ color: '#151515' }}>&gt;20 issues</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{ width: '16px', height: '16px', borderRadius: '50%', marginRight: '4px', backgroundColor: '#f0ab00' }}
              ></div>
              <span style={{ color: '#151515' }}>5-20 issues</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{ width: '16px', height: '16px', borderRadius: '50%', marginRight: '4px', backgroundColor: '#3e8635' }}
              ></div>
              <span style={{ color: '#151515' }}>&lt;5 issues</span>
            </div>
          </div>

          {/* Type Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '0.875rem' }}>
            <span style={{ color: '#6a6e73', fontWeight: '600', marginRight: '4px' }}>Component Type:</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" fill="none" stroke="#151515" strokeWidth="1.0"/>
                <line x1="12" y1="4" x2="12" y2="20" stroke="#151515" strokeWidth="1.0"/>
                <line x1="4" y1="12" x2="20" y2="12" stroke="#151515" strokeWidth="1.0"/>
              </svg>
              <span style={{ color: '#151515' }}>Frontend</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <rect x="5" y="7" width="14" height="2.5" fill="#151515"/>
                <rect x="5" y="11" width="14" height="2.5" fill="#151515"/>
                <rect x="5" y="15" width="14" height="2.5" fill="#151515"/>
              </svg>
              <span style={{ color: '#151515' }}>Backend</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M 12 4 L 20 12 L 12 20 L 4 12 Z" fill="none" stroke="#151515" strokeWidth="1.0"/>
              </svg>
              <span style={{ color: '#151515' }}>Middleware</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <ellipse cx="12" cy="8" rx="6" ry="2.5" fill="none" stroke="#151515" strokeWidth="1.0"/>
                <line x1="6" y1="8" x2="6" y2="16" stroke="#151515" strokeWidth="1.0"/>
                <line x1="18" y1="8" x2="18" y2="16" stroke="#151515" strokeWidth="1.0"/>
                <ellipse cx="12" cy="16" rx="6" ry="2.5" fill="none" stroke="#151515" strokeWidth="1.0"/>
              </svg>
              <span style={{ color: '#151515' }}>Data</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M 8 10 L 16 10 L 16 18 L 8 18 Z" fill="none" stroke="#151515" strokeWidth="1.0"/>
                <path d="M 8 10 L 12 6 L 20 6 L 16 10" fill="none" stroke="#151515" strokeWidth="1.0"/>
                <path d="M 16 10 L 20 6 L 20 14 L 16 18" fill="none" stroke="#151515" strokeWidth="1.0"/>
              </svg>
              <span style={{ color: '#151515' }}>Infrastructure</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ArchitectureGraph;
