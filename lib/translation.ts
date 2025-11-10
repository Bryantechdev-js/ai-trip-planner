interface TranslationCache {
  [key: string]: string
}

class TranslationService {
  private cache: TranslationCache = {}
  private supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'sw', name: 'Swahili' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'ig', name: 'Igbo' },
    { code: 'ha', name: 'Hausa' },
  ]

  getSupportedLanguages() {
    return this.supportedLanguages
  }

  async translateText(text: string, targetLanguage: string, sourceLanguage = 'en'): Promise<string> {
    if (sourceLanguage === targetLanguage) {
      return text
    }

    const cacheKey = `${sourceLanguage}-${targetLanguage}-${text}`
    
    // Check cache first
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey]
    }

    try {
      // Use a free translation API or fallback to browser API
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage,
          sourceLanguage,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const translatedText = data.translatedText || text
        
        // Cache the result
        this.cache[cacheKey] = translatedText
        return translatedText
      }
    } catch (error) {
      console.error('Translation API error:', error)
    }

    // Fallback: return original text if translation fails
    return text
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch('/api/detect-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.language || 'en'
      }
    } catch (error) {
      console.error('Language detection error:', error)
    }

    return 'en' // Default to English
  }

  clearCache() {
    this.cache = {}
  }

  // Simple language detection based on common patterns
  simpleLanguageDetection(text: string): string {
    const patterns = {
      es: /\b(el|la|los|las|un|una|de|en|con|por|para|que|es|son|está|están)\b/gi,
      fr: /\b(le|la|les|un|une|de|du|des|en|avec|pour|que|est|sont|être|avoir)\b/gi,
      de: /\b(der|die|das|ein|eine|und|oder|mit|für|von|zu|ist|sind|haben|sein)\b/gi,
      it: /\b(il|la|lo|gli|le|un|una|di|da|in|con|per|che|è|sono|essere|avere)\b/gi,
      pt: /\b(o|a|os|as|um|uma|de|em|com|para|que|é|são|estar|ter|ser)\b/gi,
      ru: /[а-яё]/gi,
      ar: /[ا-ي]/gi,
      zh: /[\u4e00-\u9fff]/gi,
      ja: /[\u3040-\u309f\u30a0-\u30ff]/gi,
      ko: /[\uac00-\ud7af]/gi,
    }

    for (const [lang, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern)
      if (matches && matches.length > 2) {
        return lang
      }
    }

    return 'en'
  }
}

export const translationService = new TranslationService()

// Translation API route handler
export async function translateWithFallback(text: string, targetLang: string, sourceLang = 'en') {
  try {
    return await translationService.translateText(text, targetLang, sourceLang)
  } catch (error) {
    console.error('Translation failed:', error)
    return text
  }
}