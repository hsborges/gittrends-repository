/*
 *  Author: Hudson S. Borges
 */
const { knex } = require('@gittrends/database-config');
const { actors: ActorsDAO, metadata: MetadataDAO } = require('./dao');

const Updater = require('./Updater');
const Query = require('../github/graphql/Query');
const ActorComponent = require('../github/graphql/components/ActorComponent');

module.exports = class ActorsUpdater extends Updater {
  constructor(id) {
    super();
    this.id = id;
  }

  async update() {
    await Query.create()
      .compose(
        ...(Array.isArray(this.id) ? this.id : [this.id]).map((id, index) =>
          ActorComponent.create({ id, alias: `actor_${index}` })
        )
      )
      .then(({ _, actors }) =>
        knex.transaction((trx) =>
          Promise.all([
            ActorsDAO.upsert(actors, trx),
            MetadataDAO.upsert(
              actors.map((actor) => ({
                id: actor.id,
                resource: 'actor',
                key: 'updatedAt',
                value: new Date().toISOString()
              })),
              trx
            )
          ])
        )
      );
  }
};
