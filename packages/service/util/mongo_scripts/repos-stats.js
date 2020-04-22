var fields = [
  'stargazers',
  'watchers',
  'tags',
  'releases',
  'issues',
  'pulls',
  'reactions',
  'dependencies'
];

var pipe1 = fields.reduce(
  (acc, f) =>
    Object.assign({}, acc, {
      [f]: { $cond: [{ $ne: [`$_meta.${f}.updated_at`, undefined] }, 1, 0] }
    }),
  { repos: { $cond: [{ $ne: ['$_meta.updated_at', undefined] }, 1, 0] } }
);

var pipe2 = fields.reduce((acc, f) => Object.assign({}, acc, { [f]: { $sum: `$${f}` } }), {
  repos: { $sum: '$repos' }
});

var result = db.Repositories.aggregate([
  { $addFields: pipe1 },
  { $group: Object.assign({ _id: null, total: { $sum: 1 } }, pipe2) },
  { $project: { _id: 0 } }
]).toArray()[0];

['repos'].concat(fields).forEach((res) =>
  printjson({
    resource: res,
    total: result[res],
    ratio: result[res] / result.total
  })
);
