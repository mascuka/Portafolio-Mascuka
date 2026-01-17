import translate from 'translate';

export const useTranslate = () => {
  const translateText = async (text, from = 'es', to = 'en') => {
    try {
      return await translate(text, { from, to });
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const translateMultiple = async (texts) => {
    try {
      return await Promise.all(
        texts.map(text => translate(text, { from: 'es', to: 'en' }))
      );
    } catch (error) {
      console.error('Translation error:', error);
      return texts;
    }
  };

  return { translateText, translateMultiple };
};