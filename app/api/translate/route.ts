import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2'

// Fallback translations for common phrases
const fallbackTranslations: Record<string, Record<string, string>> = {
  en: {
    'AI is thinking...': 'AI is thinking...',
    'Type your message here...': 'Type your message here...',
    'Welcome to DreamTrip Adventures!': 'Welcome to DreamTrip Adventures!',
    'Sorry, I encountered an error. Please try again.': 'Sorry, I encountered an error. Please try again.',
  },
  fr: {
    'AI is thinking...': 'L\'IA réfléchit...',
    'Type your message here...': 'Tapez votre message ici...',
    'Welcome to DreamTrip Adventures!': 'Bienvenue chez DreamTrip Adventures!',
    'Sorry, I encountered an error. Please try again.': 'Désolé, j\'ai rencontré une erreur. Veuillez réessayer.',
  },
  es: {
    'AI is thinking...': 'La IA está pensando...',
    'Type your message here...': 'Escribe tu mensaje aquí...',
    'Welcome to DreamTrip Adventures!': '¡Bienvenido a DreamTrip Adventures!',
    'Sorry, I encountered an error. Please try again.': 'Lo siento, encontré un error. Por favor, inténtalo de nuevo.',
  },
  de: {
    'AI is thinking...': 'KI denkt nach...',
    'Type your message here...': 'Geben Sie hier Ihre Nachricht ein...',
    'Welcome to DreamTrip Adventures!': 'Willkommen bei DreamTrip Adventures!',
    'Sorry, I encountered an error. Please try again.': 'Entschuldigung, ich bin auf einen Fehler gestoßen. Bitte versuchen Sie es erneut.',
  },
  zh: {
    'AI is thinking...': 'AI正在思考...',
    'Type your message here...': '在此输入您的消息...',
    'Welcome to DreamTrip Adventures!': '欢迎来到DreamTrip Adventures!',
    'Sorry, I encountered an error. Please try again.': '抱歉，我遇到了错误。请重试。',
  },
  ar: {
    'AI is thinking...': 'الذكاء الاصطناعي يفكر...',
    'Type your message here...': 'اكتب رسالتك هنا...',
    'Welcome to DreamTrip Adventures!': 'مرحباً بك في DreamTrip Adventures!',
    'Sorry, I encountered an error. Please try again.': 'آسف، واجهت خطأ. يرجى المحاولة مرة أخرى.',
  },
  pt: {
    'AI is thinking...': 'IA está pensando...',
    'Type your message here...': 'Digite sua mensagem aqui...',
    'Welcome to DreamTrip Adventures!': 'Bem-vindo ao DreamTrip Adventures!',
    'Sorry, I encountered an error. Please try again.': 'Desculpe, encontrei um erro. Tente novamente.',
  },
  ru: {
    'AI is thinking...': 'ИИ думает...',
    'Type your message here...': 'Введите ваше сообщение здесь...',
    'Welcome to DreamTrip Adventures!': 'Добро пожаловать в DreamTrip Adventures!',
    'Sorry, I encountered an error. Please try again.': 'Извините, произошла ошибка. Попробуйте еще раз.',
  },
  ja: {
    'AI is thinking...': 'AIが考えています...',
    'Type your message here...': 'ここにメッセージを入力してください...',
    'Welcome to DreamTrip Adventures!': 'DreamTrip Adventuresへようこそ！',
    'Sorry, I encountered an error. Please try again.': '申し訳ございませんが、エラーが発生しました。もう一度お試しください。',
  },
  ko: {
    'AI is thinking...': 'AI가 생각하고 있습니다...',
    'Type your message here...': '여기에 메시지를 입력하세요...',
    'Welcome to DreamTrip Adventures!': 'DreamTrip Adventures에 오신 것을 환영합니다!',
    'Sorry, I encountered an error. Please try again.': '죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.',
  },
}

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage = 'en' } = await req.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      )
    }

    // Return original text if target language is the same as source
    if (targetLanguage === sourceLanguage) {
      return NextResponse.json({ translatedText: text })
    }

    // Check fallback translations first
    if (fallbackTranslations[targetLanguage] && fallbackTranslations[targetLanguage][text]) {
      return NextResponse.json({
        translatedText: fallbackTranslations[targetLanguage][text],
        source: 'fallback'
      })
    }

    // Use Google Translate API if available
    if (GOOGLE_TRANSLATE_API_KEY) {
      try {
        const response = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: targetLanguage,
            source: sourceLanguage,
            format: 'text',
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const translatedText = data.data?.translations?.[0]?.translatedText

          if (translatedText) {
            return NextResponse.json({
              translatedText,
              source: 'google',
              detectedSourceLanguage: data.data?.translations?.[0]?.detectedSourceLanguage,
            })
          }
        }
      } catch (error) {
        console.error('Google Translate API error:', error)
      }
    }

    // Fallback to simple text processing for basic translations
    const basicTranslations: Record<string, string> = {
      hello: targetLanguage === 'fr' ? 'bonjour' : 
             targetLanguage === 'es' ? 'hola' :
             targetLanguage === 'de' ? 'hallo' :
             targetLanguage === 'zh' ? '你好' :
             targetLanguage === 'ar' ? 'مرحبا' :
             targetLanguage === 'pt' ? 'olá' :
             targetLanguage === 'ru' ? 'привет' :
             targetLanguage === 'ja' ? 'こんにちは' :
             targetLanguage === 'ko' ? '안녕하세요' : 'hello',
      
      thank: targetLanguage === 'fr' ? 'merci' :
             targetLanguage === 'es' ? 'gracias' :
             targetLanguage === 'de' ? 'danke' :
             targetLanguage === 'zh' ? '谢谢' :
             targetLanguage === 'ar' ? 'شكرا' :
             targetLanguage === 'pt' ? 'obrigado' :
             targetLanguage === 'ru' ? 'спасибо' :
             targetLanguage === 'ja' ? 'ありがとう' :
             targetLanguage === 'ko' ? '감사합니다' : 'thank you',
    }

    const lowerText = text.toLowerCase()
    for (const [key, translation] of Object.entries(basicTranslations)) {
      if (lowerText.includes(key)) {
        return NextResponse.json({
          translatedText: translation,
          source: 'basic'
        })
      }
    }

    // Return original text if no translation available
    return NextResponse.json({
      translatedText: text,
      source: 'original',
      note: 'Translation service unavailable, showing original text'
    })

  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed', originalText: req.body?.text },
      { status: 500 }
    )
  }
}