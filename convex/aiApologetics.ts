import { action } from "./_generated/server";
import { v } from "convex/values";

export const askApologist = action({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return {
                success: false,
                error: "Configuration error: GEMINI_API_KEY is missing.",
            };
        }

        try {
            const prompt = `
        Tu es un théologien catholique expert en apologétique, fidèle au Magistère de l'Église. 
        Ton but est de donner des arguments clairs, charitables mais fermes pour défendre la foi catholique face à des questions ou objections.
        
        Question de l'utilisateur : "${args.query}"
        
        Réponds impérativement au format JSON valide avec la structure suivante :
        {
          "directAnswer": "Une réponse directe et concise (2-3 phrases) qui résume la position de l'Église.",
          "explanation": "Une explication détaillée avec des arguments logiques et théologiques.",
          "biblicalQuotes": [
            { "reference": "Livre Chapitre:Verset", "text": "Texte du verset" }
          ],
          "traditionQuotes": [
            { "source": "Nom du Père de l'Église ou document (ex: St Augustin, CEC)", "text": "Citation pertinente" }
          ],
          "keyTakeaway": "Une phrase choc ou un résumé spirituel à retenir."
        }
        
        Assure-toi que le JSON est valide et ne contient pas de markdown (pas de \`\`\`json).
      `;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.statusText}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error("No response content from Gemini");
            }

            // Clean up markdown if present despite instructions
            const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const result = JSON.parse(cleanJson);

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error("AI Apologist error:", error);
            return {
                success: false,
                error: "Une erreur est survenue lors de la consultation de l'assistant.",
            };
        }
    },
});
