/*
 *  Author: Hudson S. Borges
 */
import { Router } from 'express';

import { authorize } from '../controllers/github.controller';

const router = Router();

router.get('/authorize', authorize);

export default router;
