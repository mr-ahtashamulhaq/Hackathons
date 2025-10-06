// Gemini AI utility for generating climate insights
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ClimateInsight {
  summary: string;
  keyFindings: string[];
  outlook: string;
  error?: string;
}

let genAI: GoogleGenerativeAI | null = null;

function initializeGemini() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Gemini API key not found. AI insights will be mocked.');
    return null;
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Generate climate insights from weather data trends
 */
export async function generateClimateInsight(
  trends: {
    averageTemperature: number;
    totalPrecipitation: number;
    averageHumidity: number;
    temperatureTrend: number;
  },
  startYear: string = '2020',
  endYear: string = '2024'
): Promise<ClimateInsight> {
  try {
    const gemini = initializeGemini();
    
    if (!gemini) {
      return generateMockInsight(trends, startYear, endYear);
    }

    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
As a climate data analyst, analyze the following weather trends for Lahore, Pakistan from ${startYear} to ${endYear}:

- Average Temperature: ${trends.averageTemperature}°C
- Total Precipitation: ${trends.totalPrecipitation}mm
- Average Humidity: ${trends.averageHumidity}%
- Temperature Trend: ${trends.temperatureTrend > 0 ? '+' : ''}${trends.temperatureTrend}°C per year

Please provide:
1. A brief summary (2-3 sentences) of the overall climate pattern
2. 3-4 key findings about temperature, precipitation, and humidity trends
3. A short outlook statement about what this means for the city

Keep it concise, scientific but accessible to the general public. Focus on concrete numbers and practical implications.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return parseGeminiResponse(text, trends);
    
  } catch (error) {
    console.error('Error generating AI insight:', error);
    return generateMockInsight(trends, startYear, endYear);
  }
}

/**
 * Parse Gemini response into structured insight
 */
function parseGeminiResponse(text: string, trends: {
  averageTemperature: number;
  totalPrecipitation: number;
  averageHumidity: number;
  temperatureTrend: number;
}): ClimateInsight {
  try {
    // Simple parsing - could be improved with more sophisticated NLP
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    const summary = paragraphs[0] || generateDefaultSummary(trends);
    
    // Extract key findings (look for bullet points or numbered lists)
    const keyFindings = paragraphs
      .slice(1, -1)
      .flatMap(p => p.split('\n'))
      .filter(line => line.includes('•') || line.includes('-') || line.match(/^\d+\./))
      .map(line => line.replace(/^[\s\-\•\d\.]+/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 4);

    const outlook = paragraphs[paragraphs.length - 1] || generateDefaultOutlook();

    return {
      summary: summary.replace(/^\d+\.\s*/, '').trim(),
      keyFindings: keyFindings.length > 0 ? keyFindings : generateDefaultKeyFindings(trends),
      outlook: outlook.replace(/^\d+\.\s*/, '').trim(),
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return generateMockInsight(trends, '2020', '2024');
  }
}

/**
 * Generate mock insight when AI is unavailable
 */
function generateMockInsight(
  trends: {
    averageTemperature: number;
    totalPrecipitation: number;
    averageHumidity: number;
    temperatureTrend: number;
  },
  startYear: string,
  endYear: string
): ClimateInsight {
  const tempChange = trends.temperatureTrend > 0 ? 'warming' : 'cooling';
  const tempDirection = trends.temperatureTrend > 0 ? 'increased' : 'decreased';
  
  return {
    summary: `Lahore's climate from ${startYear} to ${endYear} shows a ${tempChange} trend with an average temperature of ${trends.averageTemperature}°C. The city experienced ${trends.totalPrecipitation}mm of total precipitation with ${trends.averageHumidity}% average humidity, indicating typical subtropical conditions.`,
    keyFindings: [
      `Temperature has ${tempDirection} by approximately ${Math.abs(trends.temperatureTrend * 4).toFixed(2)}°C over the 4-year period`,
      `Annual precipitation averaged ${Math.round(trends.totalPrecipitation / 4)}mm per year, reflecting monsoon patterns`,
      `Humidity levels remained consistent at ${trends.averageHumidity}%, typical for the region's subtropical climate`,
      `Climate patterns align with seasonal variations expected in Punjab province`
    ],
    outlook: `These trends suggest Lahore continues to experience typical subtropical climate patterns. The ${tempChange} trend warrants monitoring for urban planning and environmental management. Residents should prepare for continued seasonal variations with emphasis on ${trends.temperatureTrend > 0 ? 'heat management' : 'temperature fluctuations'}.`
  };
}

function generateDefaultSummary(trends: {
  averageTemperature: number;
  totalPrecipitation: number;
  averageHumidity: number;
  temperatureTrend: number;
}): string {
  return `Climate analysis shows average temperatures of ${trends.averageTemperature}°C with moderate precipitation patterns and stable humidity levels.`;
}

function generateDefaultKeyFindings(trends: {
  averageTemperature: number;
  totalPrecipitation: number;
  averageHumidity: number;
  temperatureTrend: number;
}): string[] {
  return [
    `Average temperature: ${trends.averageTemperature}°C`,
    `Total precipitation: ${trends.totalPrecipitation}mm`,
    `Average humidity: ${trends.averageHumidity}%`,
    `Temperature trend: ${trends.temperatureTrend > 0 ? '+' : ''}${trends.temperatureTrend}°C/year`
  ];
}

function generateDefaultOutlook(): string {
  return `Current trends suggest continued monitoring is important for understanding Lahore's changing climate patterns.`;
}

/**
 * Validate API key availability
 */
export function hasGeminiApiKey(): boolean {
  return !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
}