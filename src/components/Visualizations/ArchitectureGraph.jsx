import { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
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
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Application Architecture
      </h2>
      <div ref={containerRef} className="relative bg-gray-50 rounded">
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
            className="flex items-center justify-center text-gray-500"
            style={{ height: dimensions.height }}
          >
            No graph data available
          </div>
        )}
      </div>

      {/* Legends */}
      <div className="mt-4 flex flex-col items-center space-y-3">
        {/* Color Legend */}
        <div className="flex items-center space-x-6 text-sm">
          <span className="text-gray-500 font-medium mr-2">Issue Severity:</span>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: '#ff6b6b' }}
            ></div>
            <span className="text-gray-600">&gt;20 issues</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: '#ffd93d' }}
            ></div>
            <span className="text-gray-600">5-20 issues</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: '#95e1d3' }}
            ></div>
            <span className="text-gray-600">&lt;5 issues</span>
          </div>
        </div>

        {/* Icon Legend */}
        <div className="flex items-center space-x-6 text-sm">
          <span className="text-gray-500 font-medium mr-2">Component Type:</span>
          <div className="flex items-center">
            <span className="mr-2">🌐</span>
            <span className="text-gray-600">Frontend</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">⚙️</span>
            <span className="text-gray-600">Backend</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">🔌</span>
            <span className="text-gray-600">Middleware</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">🔧</span>
            <span className="text-gray-600">Infrastructure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureGraph;
