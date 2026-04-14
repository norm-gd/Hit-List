import { MAX_URL_LENGTH } from '../constants';

export const DEFAULT_OPERATOR = 'OPERATOR_01';
export const DEFAULT_POWER_COLOR = '#f6ffc0';

export function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const data = params.get('data');
  const op = params.get('op');
  const theme = params.get('theme');

  let lists = [];
  if (data) {
    try {
      lists = JSON.parse(atob(data));
    } catch (e) {
      console.error('Invalid data in URL');
    }
  }

  return {
    lists,
    operatorName: op || DEFAULT_OPERATOR,
    powerColor: theme || DEFAULT_POWER_COLOR,
    hasData: !!data
  };
}

export function buildUrl({ lists, operatorName, powerColor }) {
  const params = new URLSearchParams();
  if (lists.length > 0) {
    const encoded = btoa(JSON.stringify(lists));
    const testUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    if (testUrl.length <= MAX_URL_LENGTH) {
      params.set('data', encoded);
    }
  }
  if (operatorName) {
    params.set('op', operatorName);
  }
  if (powerColor && powerColor !== DEFAULT_POWER_COLOR) {
    params.set('theme', powerColor);
  }

  const qs = params.toString();
  return qs
    ? `${window.location.origin}${window.location.pathname}?${qs}`
    : `${window.location.origin}${window.location.pathname}`;
}

export function buildShareUrl({ lists, operatorName, powerColor }) {
  const params = new URLSearchParams();
  if (lists.length > 0) {
    params.set('data', btoa(JSON.stringify(lists)));
  }
  if (operatorName) {
    params.set('op', operatorName);
  }
  if (powerColor && powerColor !== DEFAULT_POWER_COLOR) {
    params.set('theme', powerColor);
  }
  const qs = params.toString();
  return qs
    ? `${window.location.origin}${window.location.pathname}?${qs}`
    : `${window.location.origin}${window.location.pathname}`;
}
