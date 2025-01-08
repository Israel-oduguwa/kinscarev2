import TagManager from 'react-gtm-module';

export const initializeGTM = (gtmId: string): void => {
  if (gtmId) {
    TagManager.initialize({
      gtmId,
    });
  }
};
