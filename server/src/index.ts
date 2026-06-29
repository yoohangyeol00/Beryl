import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { config } from './config.js';
import { pool } from './db.js';
import { attachAuthContext } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { companiesRouter } from './routes/companies.js';
import { jobsRouter } from './routes/jobs.js';
import { sendError } from './utils/apiResponse.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true
  })
);
app.use(express.json());
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.resolve(process.cwd(), 'uploads'))
);
app.use(attachAuthContext);

app.use('/api/auth', authRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/jobs', jobsRouter);

app.get('/api/health', async (_req, res, next) => {
  try {
    const result = await pool.query('select now() as now');

    res.json({
      ok: true,
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
});

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
