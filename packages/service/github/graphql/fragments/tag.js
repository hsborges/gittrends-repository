/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment tag on Tag {
  # abbreviatedOid
  # commitUrl
  id
  message
  name
  oid
  tagger { date email name user { ...actor } }
  target { ...commit }
}
`;
