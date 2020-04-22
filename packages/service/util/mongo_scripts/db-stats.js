var numberFormatter = function (value) {
  if (value < 1000) return Math.round(value * 10) / 10;
  return (numberFormatter(value / 1000) + 'K').replace('KK', 'M');
};

var diskFormatter = function (value) {
  if (value < 1024) return Math.round(value * 10) / 10;
  return (diskFormatter(value / 1024) + 'K').replace('KK', 'M').replace('MK', 'G');
};

db.getCollectionNames()
  .map((name) => {
    var stats = db.getCollection(name).stats();
    stats.ns = name;
    return stats;
  })
  .sort((a, b) => b.count - a.count)
  .map((stats) => ({
    name: stats.ns,
    records: numberFormatter(stats.count),
    size: diskFormatter(stats.size)
  }))
  .forEach((r) => printjson(r));
