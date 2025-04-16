import express, { Request, Response } from 'express';
import serverless from 'serverless-http';
import * as sweph from 'sweph';
import path from 'path';
import cors from 'cors';
import { promisify } from 'util';
import { exec } from 'child_process';

// Initialize Express app
const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Initialize sweph
try {
  sweph.set_ephe_path(process.env.SWEPH_PATH || path.join(__dirname, 'ephemeris'));
} catch (error) {
  console.error('Error setting ephemeris path:', error);
}

// Main endpoint for positions
app.get('/api/julday', async (req: Request, res: Response) => {
  try {
    // Convert to Julian day with timezone-adjusted values
    const now = new Date();
    const julday = sweph.julday(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDay(),
      now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600,
      sweph.constants.SE_GREG_CAL
    );

    const result = { julday };
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

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
