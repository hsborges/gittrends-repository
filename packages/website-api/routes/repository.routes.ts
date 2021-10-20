/*
 *  Author: Hudson S. Borges
 */
import { Router } from 'express';

import { get, search, getStargazerTimeseries } from '../controllers/repository.controller';

const router = Router();

router.get('/search', search);
router.get('/:id', get);
router.get('/:owner/:name', get);
router.get('/:owner/:name/stargazers', getStargazerTimeseries);

export default router;
