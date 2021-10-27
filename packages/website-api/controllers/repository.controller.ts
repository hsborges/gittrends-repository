/*
 *  Author: Hudson S. Borges
 */
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

import { prisma } from '../app';

export const get = async (req: Request, res: Response): Promise<void> => {
  const repo = await prisma.repository
    .findFirst({
      where: req.params.id
        ? { id: req.params.id }
        : { name_with_owner: `${req.params.owner}/${req.params.name}` },
      include: {
        owner: true,
        metadata: { select: { resource: true, updated_at: true } },
        topics: { select: { topic: true } }
      }
    })
    .then((result) => {
      if (result?.topics) {
        const { topics, ...repo } = result;
        return {
          ...repo,
          repository_topics: topics.reduce((memo: string[], { topic }) => memo.concat([topic]), [])
        };
      }

      return result;
    });

  if (repo) res.json(repo);
  else res.sendStatus(404);
};

export const getStargazerTimeseries = async (req: Request, res: Response): Promise<void> => {
  const repo = await prisma.repository.findFirst({
    select: { id: true },
    where: req.params.id
      ? { id: req.params.id }
      : { name_with_owner: `${req.params.owner}/${req.params.name}` }
  });

  if (!repo) {
    res.sendStatus(404);
    return;
  }

  const [timeseries, [first, last]] = await Promise.all([
    prisma.stargazerTimeseries.findMany({
      select: { date: true, stargazers_count: true },
      where: { repository_id: repo.id }
    }),
    prisma.stargazer.findMany({
      select: {
        user: { select: { id: true, login: true, name: true, avatar_url: true } },
        starred_at: true,
        type: true
      },
      where: { repository_id: repo.id }
    })
  ]);

  res.json({ timeseries, first, last });
};

export const search = async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit?.toString() ?? '24', 10);
  const offset = parseInt(req.query.offset?.toString() ?? '0', 10);
  const query = req.query.query?.toString() || '';
  const language = req.query.language?.toString() || undefined;
  const sortBy = req.query.sortBy?.toString();
  const order = req.query.order?.toString() || 'desc';

  const repos = await prisma.repository.findMany({
    select: {
      id: true,
      name: true,
      owner_id: true,
      name_with_owner: true,
      stargazers_count: true,
      watchers_count: true,
      forks_count: true,
      primary_language: true,
      open_graph_image_url: true,
      description: true
    },
    where: {
      name_with_owner: { contains: query.toLowerCase() },
      ...(language === undefined ? {} : { primary_language: language })
    },
    ...(sortBy ? { orderBy: { [sortBy]: order } } : {}),
    take: limit,
    skip: offset
  });

  const prismaSQL = Prisma.sql`
    SELECT r.primary_language AS language, COUNT(r.id) AS count
    FROM repositories r
    WHERE
      LOWER(r.name_with_owner) LIKE ${`%${query.toLowerCase()}%`}
      ${language === undefined ? Prisma.empty : Prisma.sql`AND r.primary_language = ${language}`}
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
      repositories_count: languagesCount.reduce((memo, data) => memo + data.count, 0),
      languages_count: languagesCount.reduce(
        (memo, data) => ({ ...memo, [data.language]: data.count }),
        {}
      )
    }
  });
};
