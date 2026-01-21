import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardTitle, CardBody, Title } from '@patternfly/react-core';

const MicroservicesTierDiagram = ({ microservices }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!microservices || microservices.length === 0) return;

    // Clear previous diagram
    d3.select(svgRef.current).selectAll('*').remove();

    // Organize services by tier
    const tiers = {
      gateway: microservices.filter(s => s.type === 'gateway'),
      api: microservices.filter(s => s.type === 'api'),
      worker: microservices.filter(s => s.type === 'worker'),
      'data-service': microservices.filter(s => s.type === 'data-service')
    };

    // Remove empty tiers
    Object.keys(tiers).forEach(key => {
      if (tiers[key].length === 0) delete tiers[key];
    });

    const tierNames = Object.keys(tiers);
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const width = 1000 - margin.left - margin.right;
    const height = 750 - margin.top - margin.bottom; // Increased from 600 to 750
    const tierHeight = height / tierNames.length;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define arrowhead marker - smaller size
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('refX', 7)
      .attr('refY', 3)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 8 3, 0 6')
      .attr('fill', '#6b7280')
      .attr('opacity', 0.7);

    // Tier colors
    const tierColors = {
      gateway: '#8b5cf6',
      api: '#3b82f6',
      worker: '#10b981',
      'data-service': '#f59e0b'
    };

    // Draw tiers
    tierNames.forEach((tierName, tierIndex) => {
      const services = tiers[tierName];
      const y = tierIndex * tierHeight;
      const serviceWidth = Math.min(200, (width - 40) / services.length - 20);
      const totalWidth = services.length * (serviceWidth + 20) - 20;
      const startX = (width - totalWidth) / 2;

      // Tier background
      svg.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', width)
        .attr('height', tierHeight)
        .attr('fill', '#f9fafb')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .attr('rx', 8);

      // Tier label
      svg.append('text')
        .attr('x', 10)
        .attr('y', y + 25)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#6b7280')
        .text(tierName.toUpperCase());

      // Draw services
      services.forEach((service, index) => {
        const x = startX + index * (serviceWidth + 20);
        const serviceY = y + 50;
        const boxHeight = tierHeight - 55; // Make boxes slightly shorter

        // Service box
        const serviceGroup = svg.append('g')
          .attr('class', 'service-node')
          .style('cursor', 'pointer');

        serviceGroup.append('rect')
          .attr('x', x)
          .attr('y', serviceY)
          .attr('width', serviceWidth)
          .attr('height', boxHeight)
          .attr('fill', 'white')
          .attr('stroke', tierColors[tierName])
          .attr('stroke-width', 2)
          .attr('rx', 6)
          .on('mouseenter', function() {
            d3.select(this)
              .attr('stroke-width', 3)
              .attr('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))');
          })
          .on('mouseleave', function() {
            d3.select(this)
              .attr('stroke-width', 2)
              .attr('filter', 'none');
          });

        // Service type badge - calculate width based on text
        const badgeText = service.type;
        const badgeWidth = Math.max(70, badgeText.length * 7 + 16);

        serviceGroup.append('rect')
          .attr('x', x + 5)
          .attr('y', serviceY + 5)
          .attr('width', badgeWidth)
          .attr('height', 20)
          .attr('fill', tierColors[tierName])
          .attr('rx', 10);

        serviceGroup.append('text')
          .attr('x', x + 5 + badgeWidth / 2)
          .attr('y', serviceY + 18)
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('fill', 'white')
          .attr('text-anchor', 'middle')
          .text(badgeText);

        // Service name - wrap text properly
        const maxLineWidth = serviceWidth - 20; // Padding
        const words = service.name.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          // Rough estimate: ~7px per character
          if (testLine.length * 7 > maxLineWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) {
          lines.push(currentLine);
        }

        // Component tags - positioned at top, right below badge
        if (service.components && service.components.length > 0) {
          const componentBoxHeight = 16;
          const componentBoxPadding = 4;
          const componentSpacing = 4;
          const componentsStartY = serviceY + 30;
          const maxComponentWidth = serviceWidth - 20; // Leave padding on sides

          // Calculate layout for component boxes
          const componentBoxes = service.components.map(comp => {
            // Estimate width based on text length - ensure enough space
            const textWidth = comp.length * 6.5;
            return {
              name: comp,
              width: Math.min(textWidth + componentBoxPadding * 2 + 8, maxComponentWidth)
            };
          });

          // Position component boxes with proper wrapping
          let currentX = x + 10;
          let currentY = componentsStartY;
          const rightBound = x + serviceWidth - 10;

          componentBoxes.forEach((comp) => {
            // Check if we need to wrap to next line
            if (currentX + comp.width > rightBound && currentX > x + 10) {
              currentX = x + 10;
              currentY += componentBoxHeight + componentSpacing;
            }

            // Ensure we don't exceed right boundary even for single items
            const actualWidth = Math.min(comp.width, rightBound - currentX);

            // Draw component box
            serviceGroup.append('rect')
              .attr('x', currentX)
              .attr('y', currentY)
              .attr('width', actualWidth)
              .attr('height', componentBoxHeight)
              .attr('fill', '#e5e7eb')
              .attr('rx', 3);

            // Draw component name with text overflow handling
            serviceGroup.append('text')
              .attr('x', currentX + actualWidth / 2)
              .attr('y', currentY + componentBoxHeight / 2 + 3.5)
              .attr('font-size', '9px')
              .attr('fill', '#6b7280')
              .attr('text-anchor', 'middle')
              .text(comp.name);

            currentX += actualWidth + componentSpacing;
          });
        }

        // Draw service name lines - positioned near bottom of box
        const fontSize = 12;
        const lineHeight = 14;
        const nameStartY = serviceY + 85;

        lines.forEach((line, i) => {
          serviceGroup.append('text')
            .attr('x', x + serviceWidth / 2)
            .attr('y', nameStartY + i * lineHeight)
            .attr('font-size', `${fontSize}px`)
            .attr('font-weight', '600')
            .attr('fill', '#1f2937')
            .attr('text-anchor', 'middle')
            .text(line);
        });
      });
    });

    // Draw all connections after boxes are rendered
    tierNames.forEach((tierName, tierIndex) => {
      if (tierIndex < tierNames.length - 1) {
        const services = tiers[tierName];
        const tierHeight = height / tierNames.length;
        const y = tierIndex * tierHeight;
        const serviceWidth = Math.min(200, (width - 40) / services.length - 20);
        const totalWidth = services.length * (serviceWidth + 20) - 20;
        const startX = (width - totalWidth) / 2;

        const nextTierY = (tierIndex + 1) * tierHeight + 50;
        const nextTierServices = tiers[tierNames[tierIndex + 1]];
        const nextServiceWidth = Math.min(200, (width - 40) / nextTierServices.length - 20);
        const nextTotalWidth = nextTierServices.length * (nextServiceWidth + 20) - 20;
        const nextStartX = (width - nextTotalWidth) / 2;

        services.forEach((_, index) => {
          const x = startX + index * (serviceWidth + 20);
          const serviceY = y + 50;
          const boxHeight = tierHeight - 55; // Match box height from above

          // Connect to all services in next tier
          nextTierServices.forEach((_, nextIndex) => {
            const nextX = nextStartX + nextIndex * (nextServiceWidth + 20);

            // Calculate start and end points
            const startXPos = x + serviceWidth / 2;
            const startYPos = serviceY + boxHeight;
            const endXPos = nextX + nextServiceWidth / 2;
            const endYPos = nextTierY;

            // Draw arrow line
            svg.append('line')
              .attr('x1', startXPos)
              .attr('y1', startYPos)
              .attr('x2', endXPos)
              .attr('y2', endYPos - 5)
              .attr('stroke', '#6b7280')
              .attr('stroke-width', 2.5)
              .attr('opacity', 0.7)
              .attr('marker-end', 'url(#arrowhead)');
          });
        });
      }
    });

  }, [microservices]);

  if (!microservices || microservices.length === 0) {
    return null;
  }

  return (
    <Card style={{ marginTop: 'var(--pf-v5-global--spacer--lg)' }}>
      <CardTitle>
        <Title headingLevel="h3" size="lg">
          🏗️ Proposed Architecture
        </Title>
      </CardTitle>
      <CardBody>
        <div style={{ overflowX: 'auto' }}>
          <svg ref={svgRef} style={{ margin: '0 auto', display: 'block' }}></svg>
        </div>
        <div style={{ marginTop: 'var(--pf-v5-global--spacer--md)', display: 'flex', flexWrap: 'wrap', gap: 'var(--pf-v5-global--spacer--md)', justifyContent: 'center', fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--xs)' }}>
            <div style={{ width: '16px', height: '16px', backgroundColor: '#8b5cf6', borderRadius: 'var(--pf-v5-global--BorderRadius--sm)' }}></div>
            <span style={{ color: 'var(--pf-v5-global--Color--100)' }}>Gateway</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--xs)' }}>
            <div style={{ width: '16px', height: '16px', backgroundColor: '#3b82f6', borderRadius: 'var(--pf-v5-global--BorderRadius--sm)' }}></div>
            <span style={{ color: 'var(--pf-v5-global--Color--100)' }}>API Service</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--xs)' }}>
            <div style={{ width: '16px', height: '16px', backgroundColor: '#10b981', borderRadius: 'var(--pf-v5-global--BorderRadius--sm)' }}></div>
            <span style={{ color: 'var(--pf-v5-global--Color--100)' }}>Worker</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-v5-global--spacer--xs)' }}>
            <div style={{ width: '16px', height: '16px', backgroundColor: '#f59e0b', borderRadius: 'var(--pf-v5-global--BorderRadius--sm)' }}></div>
            <span style={{ color: 'var(--pf-v5-global--Color--100)' }}>Data Service</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default MicroservicesTierDiagram;
