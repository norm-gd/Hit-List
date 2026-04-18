import { useEffect } from 'react';
import { buildUrl } from '../utils/url';

export function useUrlSync({ lists, operatorName, powerColor }) {
  useEffect(() => {
    const url = buildUrl({ lists, operatorName, powerColor });
    if (url !== window.location.href) { // <url different> -> re-render canvas 
      window.history.replaceState(null, '', url);
    }
  }, [lists, operatorName, powerColor]);
}
