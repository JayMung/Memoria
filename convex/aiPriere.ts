"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// Generate a personalized confession prayer using Gemini
export const generateConfessionPrayer = action({
    args: {
        peches: v.array(v.string()), // List of sins text
    },
    handler: async (ctx, args): Promise<{
        success: boolean;
        prayer?: string;
        error?: string;
    }> => {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return {
                success: false,
                error: "Clé API Gemini non configurée.",
            };
        }

        try {
            const pechesList = args.peches.map(p => `- ${p}`).join("\n");

            const prompt = `Tu es un prêtre accompagnateur spirituel bienveillant. 
Un fidèle vient de faire son examen de conscience et a reconnu les péchés suivants :

${pechesList}

Rédige une prière de confession (acte de contrition personnalisé) à la première personne ("Seigneur, ...").
La prière doit :
1. Être humble et sincère.
2. Demander pardon spécifiquement pour les fautes mentionnées (en les regroupant si nécessaire pour la fluidité).
3. Exprimer le regret d'avoir offensé Dieu.
4. Se terminer par une ferme résolution et une confiance en la miséricorde divine.
5. Être d'une longueur modérée (environ 150-200 mots).

Réponds UNIQUEMENT par le texte de la prière, sans introduction ni conclusion.`;

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
                            temperature: 0.4,
                            maxOutputTokens: 1024,
                        },
                    }),
                }
            );

            if (!response.ok) {
                console.error("Gemini API error:", response.status);
                return {
                    success: false,
                    error: `Erreur API: ${response.status}`,
                };
            }

            const data = await response.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textContent) {
                return {
                    success: false,
                    error: "Aucune réponse de l'IA",
                };
            }

            return {
                success: true,
                prayer: textContent.trim(),
            };
        } catch (error) {
            console.error("AI generation error:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Erreur inconnue",
            };
        }
    },
});
