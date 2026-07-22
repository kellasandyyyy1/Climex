import { getAQIData } from './_lib/adapters';

export default async function handler(req: any, res: any) {
  try {
    const result = await getAQIData();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch air quality data' });
  }
}
