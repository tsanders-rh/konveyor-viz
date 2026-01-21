/**
 * Test script to verify code snippet extraction from Kantra reports
 */

import { readFileSync } from 'fs';
import { transformKantraReport } from './src/utils/kantraTransformer.js';

console.log('Testing code snippet extraction from Kantra report...\n');

try {
  // Read the Kantra output file
  const yamlContent = readFileSync('/Users/tsanders/Workspace/todd-out/output.yaml', 'utf8');

  // Transform the data
  const result = transformKantraReport(yamlContent, {
    applicationName: 'DayTrader Test'
  });

  console.log(`✓ Successfully transformed Kantra report`);
  console.log(`  Components: ${result.components.length}`);
  console.log(`  Total Issues: ${result.summary.totalIssues}\n`);

  // Check code snippets
  let totalSnippets = 0;
  let totalImports = 0;
  let totalClasses = 0;

  console.log('Code Context by Component:');
  console.log('==========================\n');

  result.components.forEach(comp => {
    if (comp.codeContext) {
      const stats = comp.codeContext.stats;
      totalSnippets += stats.totalSnippets;
      totalImports += stats.totalImports;
      totalClasses += stats.totalClasses;

      console.log(`${comp.name}:`);
      console.log(`  Files: ${stats.totalFiles}`);
      console.log(`  Snippets: ${stats.totalSnippets}`);
      console.log(`  Imports: ${stats.totalImports}`);
      console.log(`  Classes: ${stats.totalClasses}`);

      if (comp.codeContext.allClassNames.length > 0) {
        console.log(`  Class Names: ${comp.codeContext.allClassNames.slice(0, 5).join(', ')}${comp.codeContext.allClassNames.length > 5 ? '...' : ''}`);
      }

      if (comp.codeContext.snippets.length > 0) {
        console.log(`  Sample snippet from ${comp.codeContext.snippets[0].file}:`);
        console.log('  ---');
        console.log(comp.codeContext.snippets[0].snippet.split('\n').slice(0, 10).map(l => `  ${l}`).join('\n'));
        console.log('  ...');
      }
      console.log('');
    }
  });

  console.log('\nSummary:');
  console.log('========');
  console.log(`Total Code Snippets: ${totalSnippets}`);
  console.log(`Total Imports: ${totalImports}`);
  console.log(`Total Classes: ${totalClasses}`);

  if (totalSnippets > 0) {
    console.log('\n✓ SUCCESS: Code snippets successfully extracted!');
    console.log(`  Analysis Tier: Tier 2 (Code Snippets Available)`);
  } else {
    console.log('\n⚠ WARNING: No code snippets found in report');
    console.log(`  Analysis Tier: Tier 1 (Structure Only)`);
  }

  // Test an individual issue
  const issueWithSnippet = result.components
    .flatMap(c => c.issues)
    .find(i => i.codeSnippet);

  if (issueWithSnippet) {
    console.log('\n\nSample Issue with Code Snippet:');
    console.log('================================');
    console.log(`Title: ${issueWithSnippet.title}`);
    console.log(`Location: ${issueWithSnippet.location}`);
    console.log(`Imports: ${issueWithSnippet.imports.length}`);
    console.log(`Classes: ${issueWithSnippet.classNames.join(', ')}`);
    console.log('\nCode Snippet:');
    console.log('---');
    console.log(issueWithSnippet.codeSnippet.split('\n').slice(0, 15).join('\n'));
    console.log('---');
  }

} catch (error) {
  console.error('✗ ERROR:', error.message);
  process.exit(1);
}
