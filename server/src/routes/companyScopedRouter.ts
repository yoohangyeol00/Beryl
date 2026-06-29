import { Router } from 'express';
import { requireAuth, requireCurrentCompany } from '../middleware/auth.js';

export function createCompanyScopedRouter() {
  const router = Router();

  router.use(requireAuth);
  router.use(requireCurrentCompany);

  return router;
}
