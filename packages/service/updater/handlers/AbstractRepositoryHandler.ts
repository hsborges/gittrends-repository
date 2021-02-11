/*
 *  Author: Hudson S. Borges
 */
import Handler from '../Handler';
import RepositoryComponent from '../../github/components/RepositoryComponent';

export default abstract class AbstractRepositoryHandler extends Handler<RepositoryComponent> {
  readonly id: string;
  readonly meta: { id: string; resource: string };

  writeBatchSize: number;
  batchSize: number;
  defaultBatchSize: number;

  protected constructor(id: string, alias = 'repository', resource: string) {
    super(new RepositoryComponent(id).setAlias(alias));
    this.id = id;
    this.meta = { id, resource };
    this.batchSize = this.defaultBatchSize = 100;
    this.writeBatchSize = parseInt(process.env.GITTRENDS_WRITE_BATCH_SIZE ?? '500', 10);
  }

  abstract error(err: Error): Promise<void>;
}
