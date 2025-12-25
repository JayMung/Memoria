"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// AI-powered Bible search using Google Gemini
export const searchBibleAI = action({
    args: {
        query: v.string(),
    },
    handler: async (ctx, args): Promise<{
        success: boolean;
        results: Array<{
            reference: string;
            text: string;
            explanation: string;
        }>;
        error?: string;
    }> => {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return {
                success: false,
                results: [],
                error: "Clé API Gemini non configurée. Ajoutez GEMINI_API_KEY dans vos variables d'environnement Convex.",
            };
        }

        try {
            const prompt = `Tu es un expert en Bible catholique. L'utilisateur cherche un ou plusieurs versets bibliques.

Question de l'utilisateur: "${args.query}"

Trouve les versets bibliques les plus pertinents qui correspondent à cette recherche. Retourne un JSON valide avec ce format exact:
{
  "verses": [
    {
      "reference": "Livre Chapitre:Verset (ex: 1 Corinthiens 3:15)",
      "text": "Le texte exact du verset en français",
      "explanation": "Brève explication de pourquoi ce verset correspond à la recherche"
    }
  ]
}

Retourne entre 1 et 5 versets maximum, les plus pertinents. Utilise la Bible catholique (avec les livres deutérocanoniques si pertinent).
Réponds UNIQUEMENT avec le JSON, sans autre texte.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: prompt }],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.3,
                            maxOutputTokens: 2048,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Gemini API error:", response.status, errorText);

                if (response.status === 404) {
                    return {
                        success: false,
                        results: [],
                        error: "Modèle Gemini non disponible. Vérifiez votre clé API.",
                    };
                }
                if (response.status === 400) {
                    return {
                        success: false,
                        results: [],
                        error: "Clé API invalide ou format de requête incorrect.",
                    };
                }

                return {
                    success: false,
                    results: [],
                    error: `Erreur API: ${response.status}`,
                };
            }

            const data = await response.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textContent) {
                return {
                    success: false,
                    results: [],
                    error: "Aucune réponse de l'IA",
                };
            }

            // Parse JSON from response (handle markdown code blocks)
            let jsonStr = textContent.trim();
            if (jsonStr.startsWith("```json")) {
                jsonStr = jsonStr.slice(7);
            } else if (jsonStr.startsWith("```")) {
                jsonStr = jsonStr.slice(3);
            }
            if (jsonStr.endsWith("```")) {
                jsonStr = jsonStr.slice(0, -3);
            }
            jsonStr = jsonStr.trim();

            const parsed = JSON.parse(jsonStr);

            return {
                success: true,
                results: parsed.verses || [],
            };
        } catch (error) {
            console.error("AI search error:", error);
            return {
                success: false,
                results: [],
                error: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    },
});
