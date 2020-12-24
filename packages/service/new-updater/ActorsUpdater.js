const { knex } = require('@gittrends/database-config');
const { actors: ActorsDAO } = require('../updater/helper/dao');

const Updater = require('./Updater');
const Query = require('../github/graphql/Query');
const ActorComponent = require('../github/graphql/components/ActorComponent');

module.exports = class ActorsUpdater extends Updater {
  constructor(id) {
    super();
    this.components = (Array.isArray(id) ? id : [id]).map(
      (id, index) => new ActorComponent(id, `actor_${index}`)
    );
  }

  async update() {
    await Query.create()
      .compose(...this.components)
      .then(({ _, users }) =>
        knex.transaction((trx) =>
          ActorsDAO.upsert(
            users.map((u) => ({ ...u, _updated_at: new Date() })),
            trx
          )
        )
      );
  }
};
