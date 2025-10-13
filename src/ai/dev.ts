import { config } from 'dotenv';
config();

import '@/ai/flows/vectorize-pdf-content.ts';
import '@/ai/flows/answer-questions-about-pdf.ts';
import '@/ai/flows/optimize-token-usage.ts';