/*
 *  Author: Hudson S. Borges
 */
const db = require('../connection.js');

module.exports = {
  async reactions({ issue, pull, event }) {
    if (!issue && !pull) throw new TypeError('Arguments missing');
    const query = {};
    if (issue) query.issue = issue;
    if (pull) query.pull = pull;
    if (event) query.event = event;
    await db.reactions.deleteMany(query);
  },
  async timelineEvents({ issue, pull, id }) {
    if (!issue && !pull) throw new TypeError('Arguments missing');
    await module.exports.reactions({ issue, pull, event: id });
    const query = {};
    if (issue) query.issue = issue;
    if (pull) query.pull = pull;
    if (id) query._id = id;
    await db.timeline.deleteMany(query);
  },
  async issue({ id }) {
    if (!id) throw new TypeError('Arguments missing');
    await module.exports.reactions({ issue: id });
    await module.exports.timelineEvents({ issue: id });
    await db.issues.deleteOne({ _id: id });
  },
  async pull({ id }) {
    if (!id) throw new TypeError('Arguments missing');
    await module.exports.reactions({ pull: id });
    await module.exports.timelineEvents({ pull: id });
    await db.pulls.deleteOne({ _id: id });
  }
};
