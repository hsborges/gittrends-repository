/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment mergedEvent on MergedEvent {
  actor { ...actor }
  commit { ...commit }
  createdAt
  mergeRef { name target { id } }
  mergeRefName
  url
}`;
