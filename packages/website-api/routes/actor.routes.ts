/*
 *  Author: Hudson S. Borges
 */
import { Router } from 'express';

import { get } from '../controllers/actor.controller';

const router = Router();

router.get('/:id', get);

export default router;
