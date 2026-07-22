import { getWeatherData } from './_lib/adapters.js';

export default async function handler(req: any, res: any) {
  try {
    const result = await getWeatherData();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}
