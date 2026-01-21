/**
 * LLM Provider Configuration
 *
 * To enable AI-powered insights, add your API key to a .env file:
 *
 * For Anthropic (Claude):
 *   VITE_ANTHROPIC_API_KEY=your-key-here
 *
 * For OpenAI (GPT):
 *   VITE_OPENAI_API_KEY=your-key-here
 *
 * For Ollama (Local):
 *   VITE_OLLAMA_BASE_URL=http://localhost:11434
 *   VITE_OLLAMA_MODEL=llama2
 */

export const LLM_PROVIDERS = {
  ANTHROPIC: 'anthropic',
  OPENAI: 'openai',
  OLLAMA: 'ollama',
  NONE: 'none'
};

export const llmConfig = {
  // Anthropic (Claude)
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
    model: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    baseURL: 'https://api.anthropic.com/v1',
    enabled: !!import.meta.env.VITE_ANTHROPIC_API_KEY
  },

  // OpenAI (GPT)
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o',
    baseURL: 'https://api.openai.com/v1',
    enabled: !!import.meta.env.VITE_OPENAI_API_KEY
  },

  // Ollama (Local)
  ollama: {
    baseURL: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
    model: import.meta.env.VITE_OLLAMA_MODEL || 'llama2',
    enabled: !!import.meta.env.VITE_OLLAMA_BASE_URL
  }
};

// Auto-detect which provider to use (priority order)
export const getActiveProvider = () => {
  if (llmConfig.anthropic.enabled) return LLM_PROVIDERS.ANTHROPIC;
  if (llmConfig.openai.enabled) return LLM_PROVIDERS.OPENAI;
  if (llmConfig.ollama.enabled) return LLM_PROVIDERS.OLLAMA;
  return LLM_PROVIDERS.NONE;
};

export const isLLMEnabled = () => {
  return getActiveProvider() !== LLM_PROVIDERS.NONE;
};
