import translate from 'translate';

/**
 * HOOK PARA TRADUCCIONES
 * Wrapper simple para la librería de traducción
 */

export const useTranslate = () => {
  /**
   * Traduce un texto individual
   * @param {string} text - Texto a traducir
   * @param {string} from - Idioma origen (default: 'es')
   * @param {string} to - Idioma destino (default: 'en')
   * @returns {Promise<string>} Texto traducido
   */
  const translateText = async (text, from = 'es', to = 'en') => {
    if (!text?.trim()) return text;
    
    try {
      return await translate(text, { from, to });
    } catch (error) {
      console.error('Error en traducción:', error);
      return text;
    }
  };

  /**
   * Traduce múltiples textos en paralelo
   * @param {string[]} texts - Array de textos a traducir
   * @param {string} from - Idioma origen (default: 'es')
   * @param {string} to - Idioma destino (default: 'en')
   * @returns {Promise<string[]>} Array de textos traducidos
   */
  const translateMultiple = async (texts, from = 'es', to = 'en') => {
    if (!Array.isArray(texts) || texts.length === 0) return texts;
    
    try {
      return await Promise.all(
        texts.map(text => 
          text?.trim() 
            ? translate(text, { from, to })
            : text
        )
      );
    } catch (error) {
      console.error('Error en traducción múltiple:', error);
      return texts;
    }
  };

  return { translateText, translateMultiple };
};