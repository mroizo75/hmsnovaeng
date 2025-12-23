/**
 * AI-modul for HMS Nova
 * Bruker OpenAI API for BHT-analyser og andre AI-funksjoner
 */

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Generer AI-respons via OpenAI API
 */
export async function generateAIResponse(
  prompt: string,
  model: string = "gpt-4o-mini"
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("OPENAI_API_KEY ikke konfigurert - AI-funksjoner deaktivert");
    throw new Error("AI er ikke konfigurert");
  }

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Du er en erfaren HMS-rådgiver og yrkeshygieniker som jobber for en godkjent bedriftshelsetjeneste i Norge. 
Du gir faglige råd basert på norsk arbeidsmiljølovgivning (AML), forskrift om organisering, ledelse og medvirkning, 
internkontrollforskriften, og BHT-forskriften. Svar alltid på norsk. Vær konkret og praktisk orientert.`,
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API feil: ${response.status}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("AI generation error:", error);
    throw error;
  }
}

/**
 * Generer HMS-risikoanalyse
 */
export async function generateRiskAnalysis(
  industry: string,
  employeeCount: number,
  existingRisks: string[],
  existingIncidents: string[]
): Promise<{
  suggestedRisks: { risk: string; severity: string; category: string }[];
  suggestedActions: { action: string; priority: string }[];
}> {
  const prompt = `Analyser arbeidsmiljørisiko for denne bedriften:
- Bransje: ${industry}
- Antall ansatte: ${employeeCount}
- Eksisterende risikoer: ${existingRisks.join(", ") || "Ingen registrert"}
- Tidligere avvik: ${existingIncidents.join(", ") || "Ingen registrert"}

Generer JSON med foreslåtte risikoer og tiltak:
{
  "suggestedRisks": [{"risk": "beskrivelse", "severity": "LOW|MEDIUM|HIGH", "category": "ergonomi|sikkerhet|psykososialt|kjemisk|fysisk"}],
  "suggestedActions": [{"action": "tiltak", "priority": "HIGH|MEDIUM|LOW"}]
}`;

  const response = await generateAIResponse(prompt);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  return { suggestedRisks: [], suggestedActions: [] };
}

