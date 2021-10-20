/*
 *  Author: Hudson S. Borges
 */
import { Router } from 'express';

import { get } from '../controllers/main.controller';

const router = Router();

router.get('/stats', get);

export default router;
