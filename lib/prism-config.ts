import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

// Import core languages - these will be available by default
require('prismjs/components/prism-javascript')
require('prismjs/components/prism-typescript')
require('prismjs/components/prism-jsx')
require('prismjs/components/prism-tsx')
require('prismjs/components/prism-css')
require('prismjs/components/prism-python')
require('prismjs/components/prism-bash')
require('prismjs/components/prism-json')
require('prismjs/components/prism-markdown')

// Safe highlight function that won't throw on missing languages
const safeHighlight = (code: string, lang: string) => {
  try {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang)
    }
    return code // Fallback to plain text if language not found
  } catch (e) {
    console.warn('Prism highlight error:', e)
    return code
  }
}

// Add theme configuration
const theme = {
  plain: {
    backgroundColor: "#1d1f21",
    color: "#c5c8c6"
  },
  styles: [
    {
      types: ["comment"],
      style: { color: "#969896" }
    },
    {
      types: ["string", "attr-value"],
      style: { color: "#b5bd68" }
    },
    // Add more token styles as needed
  ]
}

export { Prism, safeHighlight, theme }


