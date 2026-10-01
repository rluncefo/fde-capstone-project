import { swaggerSpec } from '../swagger';
import fs from 'fs';
import path from 'path';

const outputPath = path.join(__dirname, '../../../docs/openapi.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`OpenAPI spec exported to ${outputPath}`);
