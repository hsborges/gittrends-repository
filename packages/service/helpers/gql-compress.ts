/*
 *  Inspired by: https://github.com/jane/gql-compress
 */
export default (s: string = ''): string =>
  s
    .trim()
    .replace(/(\b|\B)[\s\t\r\n]+(\b|\B)/gm, ' ')
    .replace(/([{}[\](),:])\s+|\s+([{}[\](),:])/gm, '$1$2');
