/*
 *  Author: Hudson S. Borges
 */
/* eslint-disable @typescript-eslint/ban-types */
/** @additionalProperties false */
export default interface ICommit extends Record<string, unknown> {
  id: string;
  repository: string;
  additions?: number;
  author?: {
    date: Date;
    email?: string;
    name?: string;
    user?: string;
  };
  authored_by_committer?: boolean;
  authored_date?: Date;
  changed_files?: number;
  comments_count?: number;
  committed_date?: Date;
  committed_via_web?: boolean;
  committer?: {
    date: Date;
    email?: string;
    name?: string;
    user?: string;
  };
  deletions?: number;
  message?: string;
  oid: string;
  pushed_date?: Date;
  signature?: {
    email?: string;
    isValid?: boolean;
    signer?: string;
    state?: string;
    wasSignedByGitHub?: boolean;
  };
  status?: {
    id: string;
    contexts?: Array<{ context: string; description?: string; createdAt?: Date }>;
    state?: string;
  };
}
