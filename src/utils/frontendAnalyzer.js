/**
 * Frontend Analyzer - Language-Agnostic UI Pattern Detection
 * Works across all frontend technologies: React, Vue, Angular, JSP, Django, Rails, etc.
 */

/**
 * Detect frontend technology stack from code snippets and imports
 * @param {Array} imports - Import statements from code
 * @param {Array} snippets - Code snippets
 * @param {Array} files - File names
 * @returns {Object} Detected frontend stack
 */
export function detectFrontendStack(imports, snippets, files) {
  const stack = {
    framework: null,
    library: [],
    styling: [],
    stateManagement: null,
    router: null,
    buildTool: null
  };

  const importsStr = imports.join(' ').toLowerCase();
  const snippetsStr = snippets.map(s => s.snippet || '').join(' ').toLowerCase();
  const filesStr = files.join(' ').toLowerCase();
  const allCode = importsStr + snippetsStr + filesStr;

  // Framework Detection (language-agnostic)
  if (allCode.includes('react') || allCode.includes('jsx') || allCode.includes('.jsx') || allCode.includes('.tsx')) {
    stack.framework = 'React';
  } else if (allCode.includes('vue') || allCode.includes('.vue')) {
    stack.framework = 'Vue.js';
  } else if (allCode.includes('@angular') || allCode.includes('angular')) {
    stack.framework = 'Angular';
  } else if (allCode.includes('svelte') || allCode.includes('.svelte')) {
    stack.framework = 'Svelte';
  } else if (allCode.includes('django.template') || allCode.includes('{% ')) {
    stack.framework = 'Django Templates';
  } else if (allCode.includes('jinja') || allCode.includes('{% extends')) {
    stack.framework = 'Jinja2';
  } else if (allCode.includes('erb') || allCode.includes('.erb')) {
    stack.framework = 'ERB (Rails)';
  } else if (allCode.includes('.jsp') || allCode.includes('<%@') || allCode.includes('taglib')) {
    stack.framework = 'JSP (Java Server Pages)';
  } else if (allCode.includes('.cshtml') || allCode.includes('@model') || allCode.includes('razor')) {
    stack.framework = 'Razor (ASP.NET)';
  } else if (allCode.includes('thymeleaf') || allCode.includes('th:')) {
    stack.framework = 'Thymeleaf';
  } else if (allCode.includes('jsf') || allCode.includes('faces')) {
    stack.framework = 'JSF (JavaServer Faces)';
  } else if (allCode.includes('blade.php') || allCode.includes('@extends')) {
    stack.framework = 'Laravel Blade';
  } else if (allCode.includes('twig') || allCode.includes('{{ ')) {
    stack.framework = 'Twig (Symfony)';
  } else if (allCode.includes('handlebars') || allCode.includes('{{#')) {
    stack.framework = 'Handlebars';
  }

  // UI Component Libraries
  if (allCode.includes('material-ui') || allCode.includes('@mui')) {
    stack.library.push('Material-UI');
  }
  if (allCode.includes('antd') || allCode.includes('ant-design')) {
    stack.library.push('Ant Design');
  }
  if (allCode.includes('chakra-ui')) {
    stack.library.push('Chakra UI');
  }
  if (allCode.includes('bootstrap')) {
    stack.library.push('Bootstrap');
  }
  if (allCode.includes('primeng')) {
    stack.library.push('PrimeNG');
  }
  if (allCode.includes('vuetify')) {
    stack.library.push('Vuetify');
  }
  if (allCode.includes('element-ui')) {
    stack.library.push('Element UI');
  }

  // Styling Approaches
  if (allCode.includes('styled-components') || allCode.includes('styled.')) {
    stack.styling.push('Styled Components (CSS-in-JS)');
  }
  if (allCode.includes('@emotion')) {
    stack.styling.push('Emotion (CSS-in-JS)');
  }
  if (allCode.includes('tailwind') || allCode.includes('tw-')) {
    stack.styling.push('Tailwind CSS');
  }
  if (allCode.includes('.scss') || allCode.includes('.sass')) {
    stack.styling.push('Sass/SCSS');
  }
  if (allCode.includes('.less')) {
    stack.styling.push('Less');
  }
  if (allCode.includes('css modules') || allCode.includes('.module.css')) {
    stack.styling.push('CSS Modules');
  }
  if (allCode.includes('.css') && stack.styling.length === 0) {
    stack.styling.push('CSS');
  }

  // State Management
  if (allCode.includes('redux') || allCode.includes('createstore')) {
    stack.stateManagement = 'Redux';
  } else if (allCode.includes('mobx')) {
    stack.stateManagement = 'MobX';
  } else if (allCode.includes('vuex')) {
    stack.stateManagement = 'Vuex';
  } else if (allCode.includes('pinia')) {
    stack.stateManagement = 'Pinia';
  } else if (allCode.includes('ngrx')) {
    stack.stateManagement = 'NgRx';
  } else if (allCode.includes('zustand')) {
    stack.stateManagement = 'Zustand';
  } else if (allCode.includes('recoil')) {
    stack.stateManagement = 'Recoil';
  }

  // Routing
  if (allCode.includes('react-router') || allCode.includes('browserrouter')) {
    stack.router = 'React Router';
  } else if (allCode.includes('vue-router')) {
    stack.router = 'Vue Router';
  } else if (allCode.includes('@angular/router')) {
    stack.router = 'Angular Router';
  } else if (allCode.includes('next') && stack.framework === 'React') {
    stack.router = 'Next.js (file-based routing)';
  } else if (allCode.includes('nuxt')) {
    stack.router = 'Nuxt.js (file-based routing)';
  }

  // Build Tools
  if (allCode.includes('webpack')) {
    stack.buildTool = 'Webpack';
  } else if (allCode.includes('vite')) {
    stack.buildTool = 'Vite';
  } else if (allCode.includes('parcel')) {
    stack.buildTool = 'Parcel';
  } else if (allCode.includes('rollup')) {
    stack.buildTool = 'Rollup';
  }

  return stack;
}

/**
 * Extract UI components from code snippets (language-agnostic)
 * @param {Array} snippets - Code snippets
 * @param {string} framework - Detected framework
 * @returns {Array} List of UI components
 */
export function extractUIComponents(snippets, framework) {
  const components = new Set();
  const snippetsText = snippets.map(s => s.snippet || '').join('\n');

  // React/JSX components
  const reactMatches = snippetsText.matchAll(/(?:function|const|class)\s+([A-Z][a-zA-Z0-9]*)/g);
  for (const match of reactMatches) {
    components.add(match[1]);
  }

  // Vue components
  const vueMatches = snippetsText.matchAll(/(?:name|component):\s*['"]([A-Z][a-zA-Z0-9]*)['"]|export\s+default\s+{[\s\S]*?name:\s*['"]([^'"]+)['"]/g);
  for (const match of vueMatches) {
    if (match[1]) components.add(match[1]);
    if (match[2]) components.add(match[2]);
  }

  // Angular components
  const angularMatches = snippetsText.matchAll(/@Component\s*\(\s*{[\s\S]*?selector:\s*['"]([^'"]+)['"]/g);
  for (const match of angularMatches) {
    components.add(match[1]);
  }

  // JSP/Thymeleaf custom tags
  const jspMatches = snippetsText.matchAll(/<([a-z]+:[a-zA-Z0-9]+)/g);
  for (const match of jspMatches) {
    components.add(match[1]);
  }

  // Template includes (Django, Rails, PHP)
  const templateMatches = snippetsText.matchAll(/(?:include|render|extends)\s*['"]([^'"]+)['"]/g);
  for (const match of templateMatches) {
    const templateName = match[1].replace(/[._\/]/g, ' ').trim();
    if (templateName) components.add(templateName);
  }

  return Array.from(components);
}

/**
 * Extract styling patterns from code
 * @param {Array} snippets - Code snippets
 * @param {Array} files - File names
 * @returns {Object} Styling information
 */
export function extractStylingPatterns(snippets, files) {
  const patterns = {
    approach: null,
    cssClasses: [],
    cssVariables: [],
    themeSystem: null,
    responsive: false
  };

  const snippetsText = snippets.map(s => s.snippet || '').join('\n');
  const filesText = files.join(' ');

  // CSS Classes
  const classMatches = snippetsText.matchAll(/className\s*=\s*['"]([^'"]+)['"]/g);
  for (const match of classMatches) {
    patterns.cssClasses.push(...match[1].split(/\s+/));
  }

  // CSS Variables
  const varMatches = snippetsText.matchAll(/var\(--([^)]+)\)/g);
  for (const match of varMatches) {
    patterns.cssVariables.push(`--${match[1]}`);
  }

  // Theme system detection
  if (snippetsText.includes('theme.') || snippetsText.includes('useTheme')) {
    patterns.themeSystem = 'Theme Provider';
  }

  // Responsive design
  if (snippetsText.includes('@media') || snippetsText.includes('useMediaQuery') ||
      snippetsText.includes('breakpoint')) {
    patterns.responsive = true;
  }

  // Limit arrays
  patterns.cssClasses = [...new Set(patterns.cssClasses)].slice(0, 20);
  patterns.cssVariables = [...new Set(patterns.cssVariables)].slice(0, 10);

  return patterns;
}

/**
 * Extract routing/navigation patterns
 * @param {Array} snippets - Code snippets
 * @returns {Array} Routes/pages
 */
export function extractRoutes(snippets) {
  const routes = [];
  const snippetsText = snippets.map(s => s.snippet || '').join('\n');

  // React Router routes
  const reactRoutes = snippetsText.matchAll(/<Route\s+path=['"]([^'"]+)['"]/g);
  for (const match of reactRoutes) {
    routes.push({ path: match[1], type: 'React Router' });
  }

  // Vue Router routes
  const vueRoutes = snippetsText.matchAll(/path:\s*['"]([^'"]+)['"]/g);
  for (const match of vueRoutes) {
    routes.push({ path: match[1], type: 'Vue Router' });
  }

  // Django/Flask URL patterns
  const djangoRoutes = snippetsText.matchAll(/path\s*\(\s*['"]([^'"]+)['"]/g);
  for (const match of djangoRoutes) {
    routes.push({ path: match[1], type: 'Django/Flask' });
  }

  // Rails routes
  const railsRoutes = snippetsText.matchAll(/get\s+['"]([^'"]+)['"]/g);
  for (const match of railsRoutes) {
    routes.push({ path: match[1], type: 'Rails' });
  }

  return routes.slice(0, 20); // Limit to 20 routes
}

/**
 * Analyze frontend component for comprehensive UI patterns
 * @param {Object} component - Component with codeContext
 * @returns {Object} Frontend analysis
 */
export function analyzeFrontendComponent(component) {
  if (!component.codeContext) {
    return null;
  }

  const { snippets = [], allImports = [], files = [] } = component.codeContext;

  // Only analyze if this looks like a frontend component
  const isFrontend = component.type === 'frontend' ||
                     files.some(f => /\.(jsx?|tsx?|vue|html|jsp|erb|cshtml|blade\.php)$/i.test(f));

  if (!isFrontend) {
    return null;
  }

  const stack = detectFrontendStack(allImports, snippets, files);
  const uiComponents = extractUIComponents(snippets, stack.framework);
  const styling = extractStylingPatterns(snippets, files);
  const routes = extractRoutes(snippets);

  return {
    stack,
    uiComponents,
    styling,
    routes,
    stats: {
      componentCount: uiComponents.length,
      routeCount: routes.length,
      hasStyling: styling.cssClasses.length > 0 || styling.cssVariables.length > 0,
      hasRouting: routes.length > 0
    }
  };
}

export default {
  detectFrontendStack,
  extractUIComponents,
  extractStylingPatterns,
  extractRoutes,
  analyzeFrontendComponent
};
