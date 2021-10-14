import {
  Actor,
  Repository,
  RepositoryMetadata,
  Stargazer,
  StargazerTimeseries,
  Tag
} from './models';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Configuration, IDatabaseDriver, Options } from '@mikro-orm/core';

export default {
  entities: [Actor, Repository, RepositoryMetadata, Stargazer, StargazerTimeseries, Tag],
  type: 'sqlite',
  dbName: 'gittrends.app.sqlite',
  metadataProvider: TsMorphMetadataProvider
} as Configuration<IDatabaseDriver> | Options<IDatabaseDriver>;
