import fs from 'fs';
import path from 'path';
import { mockDB } from '../src/data/mockDB';

const outPath = path.resolve(process.cwd(), '../backend/mock_data.json');
fs.writeFileSync(outPath, JSON.stringify(mockDB, null, 2));
console.log('Dumped mock data to', outPath);
