#!/usr/bin/env node
/**
 * CLI Tool: Transforms Konveyor analysis output.yaml to the visualization format
 * Uses the shared kantraTransformer module
 */

import fs from 'fs';
import { transformKantraReport } from '../src/utils/kantraTransformer.js';

// Parse command line arguments
const analysisPath = process.argv[2] || '../coolstore-analysis/output.yaml';
const outputPath = process.argv[3] || './src/data/sampleData.json';

console.log(`Reading Konveyor analysis from: ${analysisPath}`);

try {
  // Check if input file exists
  if (!fs.existsSync(analysisPath)) {
    console.error(`Error: Input file not found: ${analysisPath}`);
    process.exit(1);
  }

  // Read the YAML file
  const yamlContent = fs.readFileSync(analysisPath, 'utf8');

  // Transform using shared transformer
  const output = transformKantraReport(yamlContent, {
    applicationName: 'Coolstore (Konveyor Analysis)',
    analysisDate: new Date().toISOString().split('T')[0]
  });

  // Display summary
  console.log(`\nAnalysis Summary:`);
  console.log(`  Components: ${output.summary.totalComponents}`);
  console.log(`  Total Issues: ${output.summary.totalIssues}`);
  console.log(`    - Critical: ${output.summary.critical}`);
  console.log(`    - Warning: ${output.summary.warning}`);
  console.log(`    - Info: ${output.summary.info}`);
  console.log(`  Estimated LOC: ${output.summary.linesOfCode.toLocaleString()}`);

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nTransformed data written to: ${outputPath}`);
} catch (error) {
  console.error(`\nError: ${error.message}`);
  process.exit(1);
}
