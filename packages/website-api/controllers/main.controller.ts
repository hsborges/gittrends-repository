/*
 *  Author: Hudson S. Borges
 */
import { Request, Response } from 'express';

import { prisma } from '../app';

export const get = async (req: Request, res: Response): Promise<void> => {
  res.json(await prisma.resourceStat.findMany());
};
