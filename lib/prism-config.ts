import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-python'
import 'prismjs/plugins/line-numbers/prism-line-numbers'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'

export const initPrism = () => {
  if (typeof window === 'undefined') return
  
  Prism.manual = true
  return Prism
}

export const syntaxHighlight = (code: string, language: string) => {
  try {
    return Prism.highlight(
      code,
      Prism.languages[language] || Prism.languages.text,
      language
    )
  } catch (e) {
    console.warn(`Failed to highlight code for language: ${language}`, e)
    return code
  }
}


