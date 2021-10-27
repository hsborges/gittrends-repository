/*
 *  Author: Hudson S. Borges
 */
import { Request, Response } from 'express';

import { prisma } from '../app';

export const get = async (req: Request, res: Response): Promise<void> => {
  const actor = await prisma.actor.findFirst({
    where: { OR: [{ id: req.params.id }, { login: req.params.id }] }
  });

  if (actor) res.json(actor);
  else res.sendStatus(404);
};
