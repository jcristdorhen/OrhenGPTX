import Prism from 'prismjs'

// Helper function to safely load a Prism language
const loadLanguage = (language: string) => {
  try {
    require(`prismjs/components/prism-${language}`)
  } catch (e) {
    console.warn(`Failed to load Prism language: ${language}`, e)
  }
}

// Initialize core languages
export function initializePrism() {
  if (typeof window === 'undefined') return // Skip on server-side

  // Core languages that should always be available
  const coreLanguages = [
    'javascript',
    'typescript',
    'jsx',
    'tsx',
    'css',
    'markup',
    'bash',
    'json',
    'markdown',
    'cpp'
  ]

  // Load each language safely
  coreLanguages.forEach(loadLanguage)

  return Prism
}
