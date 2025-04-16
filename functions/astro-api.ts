import express, { Request, Response } from 'express';
import serverless from 'serverless-http';
import path from 'path';
import cors from 'cors';
import { promisify } from 'util';
import { exec } from 'child_process';

// Initialize Express app
const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  const { stdout, stderr } = await promisify(exec)('ldd --version');
  res.json({ status: 'ok', message: `stdout: ${stdout}, stderr: ${stderr}` });
});

// Handle 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Export handler for Netlify
export const handler = serverless(app);
