/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment comment on Comment {
  author { ...actor }
  authorAssociation
  body
  createdAt
  createdViaEmail
  editor { ...actor }
  id
  includesCreatedEdit
  lastEditedAt
  publishedAt
  updatedAt
}
`;
