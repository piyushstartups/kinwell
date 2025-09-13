import { GoogleGenAI, Type } from "@google/genai";
import { FamilyMember, HealthRecord, Prescription, AIInsight } from './types.ts';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

let ai: GoogleGenAI;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.error("VITE_GEMINI_API_KEY is not available. Make sure it is set in the Vercel environment variables.");
}

export const getHealthSummary = async (
  member: FamilyMember,
  records: HealthRecord[],
  prescriptions: Prescription[]
): Promise<string> => {
  if (!ai) return "API Key is not configured. Please check the application setup.";
  const recordsText = records.length > 0
    ? records
        .slice()
        .reverse()
        .map(r => `- On ${new Date(r.date).toLocaleDateString()}, ${r.type} was ${r.value}${r.value2 ? `/${r.value2}` : ''}.`)
        .join('\n')
    : 'No health records available.';

  const prescriptionsText = prescriptions.length > 0
    ? prescriptions
        .map(p => `- ${p.name} (${p.dosage}, ${p.frequency}).`)
        .join('\n')
    : 'No active prescriptions listed.';

  const prompt = `
    You are a helpful AI assistant designed to summarize health data in a simple, easy-to-understand way for a non-medical audience.
    DO NOT PROVIDE MEDICAL ADVICE. Your goal is to summarize the provided data and highlight trends in a neutral, factual tone. 
    Always include a disclaimer to consult a doctor for any health concerns.

    Here is the data for a family member:
    Name: ${member.name}
    Age: ${member.age}
    Gender: ${member.gender}

    Health Records (most recent first):
    ${recordsText}

    Active Prescriptions:
    ${prescriptionsText}

    Based on this information, please provide a brief summary in clear, simple language. Structure your response with these sections:
    1.  **Health Records Overview:** Briefly summarize the available records.
    2.  **Prescription Overview:** Briefly list the prescriptions.

    Keep the summary concise and easy to read.

    Finally, end your entire response with the following mandatory disclaimer, exactly as written:
    "Disclaimer: This is an AI-generated summary and not medical advice. Please consult with a healthcare professional for any medical concerns or decisions."
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    return "The AI service is currently unavailable. This could be due to a missing or invalid API key. Please check your setup and try again later.";
  }
};

export const analyzePrescriptionImage = async (
  base64Image: string,
  mimeType: string
): Promise<{ name: string; dosage: string; frequency: string }> => {
  if (!ai) throw new Error("API Key is not configured.");
  const prompt = 'Analyze the following image of a prescription. Extract the medication name, dosage (e.g., "10mg"), and frequency (e.g., "Once daily"). If any field is not clearly visible, return an empty string for that field. Provide only the JSON object in your response.';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The name of the medication." },
            dosage: { type: Type.STRING, description: "The dosage, e.g., '10mg' or '1 tablet'." },
            frequency: { type: Type.STRING, description: "How often to take the medication, e.g., 'Once daily'." },
          },
          required: ['name', 'dosage', 'frequency'],
        },
      },
    });

    const jsonText = response.text.trim();
    const cleanJsonText = jsonText.startsWith('```json') ? jsonText.substring(7, jsonText.length - 3) : jsonText;
    const json = JSON.parse(cleanJsonText);
    return json;
  } catch (error) {
    console.error("Error analyzing prescription image:", error);
    throw new Error("Could not analyze the prescription image. Please ensure the image is clear and try again.");
  }
};


export const generateAIInsights = async (
  member: FamilyMember,
  records: HealthRecord[]
): Promise<Omit<AIInsight, 'id' | 'memberId'>[]> => {
    if (!ai || records.length < 3) {
        return [];
    }
    const recordsText = records
        .map(r => `On ${new Date(r.date).toISOString().split('T')[0]}, ${r.type} was ${r.value}${r.value2 ? `/${r.value2}` : ''}.`)
        .join('\n');

    const prompt = `
        You are a health data analyst AI. Analyze the following time-series health data for ${member.name} (${member.age} y/o).
        Identify up to 2 significant trends, patterns, or anomalies. Do not give medical advice.
        Focus on objective observations from the data.
        
        Data:
        ${recordsText}

        Return a JSON array of insight objects.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            category: { type: Type.STRING, enum: ['Positive Trend', 'Observation', 'Needs Attention'] },
                            date: { type: Type.STRING, description: 'ISO date string of generation time' }
                        },
                        required: ['title', 'description', 'category', 'date']
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const cleanJsonText = jsonText.startsWith('```json') ? jsonText.substring(7, jsonText.length - 3) : jsonText;
        return JSON.parse(cleanJsonText);

    } catch (error) {
        console.error("Error generating AI insights:", error);
        return [];
    }
};