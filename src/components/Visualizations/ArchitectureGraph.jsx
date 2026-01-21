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
        const height = Math.max(600, window.innerHeight - 400);
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    // Auto-fit graph after data loads
    if (fgRef.current && data.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 20);
      }, 100);
    }
  }, [data]);

  const handleNodeClick = (node) => {
    if (onNodeClick && node.fullData) {
      onNodeClick(node.fullData);
    }
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
            nodeLabel={(node) => `${node.name}\n${node.issues} issues`}
            nodeColor={(node) => getNodeColor(node.issues)}
            nodeRelSize={8}
            nodeVal={(node) => Math.max(1, node.linesOfCode / 5000)}
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
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
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
    </div>
  );
};

export default ArchitectureGraph;
