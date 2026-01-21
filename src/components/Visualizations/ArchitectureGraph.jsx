import { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { getNodeColor } from '../../utils/colorUtils';

const ArchitectureGraph = ({ data, onNodeClick }) => {
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    // Auto-fit graph on mount
    if (fgRef.current) {
      fgRef.current.zoomToFit(400);
    }
  }, []);

  useEffect(() => {
    // Update dimensions on window resize
    const handleResize = () => {
      const container = document.getElementById('graph-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.max(600, window.innerHeight - 400),
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNodeClick = (node) => {
    if (onNodeClick) {
      onNodeClick(node.fullData);
    }
  };

  return (
    <div id="graph-container" className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Application Architecture</h2>
      <div className="relative" style={{ height: dimensions.height }}>
        <ForceGraph2D
          ref={fgRef}
          graphData={data}
          width={dimensions.width - 32}
          height={dimensions.height}
          nodeLabel={(node) => `${node.name}\n${node.issues} issues`}
          nodeColor={(node) => getNodeColor(node.issues)}
          nodeVal={(node) => Math.max(5, node.linesOfCode / 2000)}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

            // Draw node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.__bckgDimensions ? node.__bckgDimensions[0] / 2 : 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = getNodeColor(node.issues);
            ctx.fill();

            // Draw label background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y + 8,
              bckgDimensions[0],
              bckgDimensions[1]
            );

            // Draw label text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#333';
            ctx.fillText(label, node.x, node.y + 8 + bckgDimensions[1] / 2);

            node.__bckgDimensions = bckgDimensions;
          }}
          onNodeClick={handleNodeClick}
          linkColor={() => '#d1d5db'}
          linkWidth={2}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          cooldownTime={3000}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />
      </div>
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-critical mr-2"></div>
          <span className="text-gray-600">&gt;20 issues</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-warning mr-2"></div>
          <span className="text-gray-600">5-20 issues</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-good mr-2"></div>
          <span className="text-gray-600">&lt;5 issues</span>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureGraph;
