/*
 *  Author: Hudson S. Borges
 */
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

import { prisma } from '../app';

export const get = async (req: Request, res: Response): Promise<void> => {
  const repo = await prisma.repository.findFirst({
    where: req.params.id
      ? { id: req.params.id }
      : { name_with_owner: `${req.params.owner}/${req.params.name}` },
    include: { metadata: true }
  });

  if (repo) {
    res.json({
      ...repo,
      metadata: repo?.metadata.reduce((m, d) => ({ ...m, [d.resource]: d.updated_at }), {})
    });
  } else {
    res.sendStatus(404);
  }
};

export const search = async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt((req.query.limit as string) ?? '24', 10);
  const offset = parseInt((req.query.offset as string) ?? '0', 10);
  const query = (req.query.query || '') as string;

  const repos = await prisma.repository.findMany({
    where: { name_with_owner: { contains: query.toLowerCase() } },
    take: limit,
    skip: offset
  });

  const prismaSQL = Prisma.sql`
    SELECT r.primary_language AS language, COUNT(r.id) AS count
    FROM repositories r
    WHERE LOWER(r.name_with_owner) LIKE ${`%${query.toLowerCase()}%`}
    GROUP BY r.primary_language
    ORDER BY count DESC
  `;

  type Result = { language: string; count: number };
  const languagesCount = await prisma.$queryRaw<Result[]>(prismaSQL);

  res.json({
    repos,
    meta: {
      limit,
      offset,
      query,
      count: languagesCount.reduce((memo, data) => ({ ...memo, [data.language]: data.count }), {})
    }
  });
};
