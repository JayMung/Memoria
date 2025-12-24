import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

// Query: Get saved fiche by verseId
export const getByVerseId = query({
    args: { verseId: v.string() },
    handler: async (ctx, args) => {
        const fiche = await ctx.db
            .query("verseFiches")
            .withIndex("by_verse", (q) => q.eq("verseId", args.verseId))
            .first();
        return fiche;
    },
});

// Mutation: Save generated fiche
export const saveFiche = mutation({
    args: {
        verseId: v.string(),
        book: v.string(),
        chapter: v.number(),
        verse: v.number(),
        verseText: v.string(),
        periodeHistoireSalut: v.string(),
        familleTheologique: v.string(),
        ideeCentrale: v.string(),
        contexteEssentiel: v.string(),
        imageMentale: v.string(),
        typologieAT: v.string(),
        typologieNT: v.string(),
        versetsCles: v.array(v.string()),
        apologetiqueVerite: v.string(),
        apologetiqueVersetsAppui: v.array(v.string()),
        apologetiqueObjection: v.string(),
        apologetiqueReponse: v.string(),
        placeHistoireSalut: v.string(),
        applicationSpirituelle: v.string(),
        resumeMemoriel: v.string(),
        astuceMemoire: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if fiche already exists
        const existing = await ctx.db
            .query("verseFiches")
            .withIndex("by_verse", (q) => q.eq("verseId", args.verseId))
            .first();

        if (existing) {
            // Update existing
            await ctx.db.patch(existing._id, {
                ...args,
                generatedAt: Date.now(),
            });
            return existing._id;
        }

        // Create new
        const id = await ctx.db.insert("verseFiches", {
            ...args,
            generatedAt: Date.now(),
        });
        return id;
    },
});

// The metaprompt for MEMORIA FIDEI generation
const METAPROMPT = `Tu es un assistant théologique catholique expert, spécialisé en :
- Sainte Écriture (Bible catholique – 73 livres)
- Tradition de l'Église catholique
- Lecture typologique (Ancien → Nouveau Testament)
- Apologétique catholique (défense rationnelle de la foi)
- Pédagogie biblique
- Sciences cognitives appliquées à la mémorisation

Ta mission est d'appliquer strictement la méthode MEMORIA FIDEI.

OBJECTIF: Transformer un verset biblique en une connaissance mémorisable, structurée, spirituelle et apologétique, fidèle à la foi catholique.

Pour le verset donné, génère une fiche complète au format JSON avec EXACTEMENT ces champs:
{
  "periodeHistoireSalut": "[Une des 12 périodes: Création, Patriarches, Exode, Juges, Royaume, Royaume divisé, Exil, Retour, Maccabées, Messie, Église, Accomplissement final]",
  "familleTheologique": "[Une famille: Alliance, Création & Chute, Loi & Commandements, Sacrifice & Expiation, Peuple de Dieu, Royauté & Royaume, etc.]",
  "ideeCentrale": "[1 phrase claire et mémorisable résumant le message du verset]",
  "contexteEssentiel": "[Situation biblique, enjeu spirituel - 3-5 phrases]",
  "imageMentale": "[Description d'UNE scène symbolique pour mémoriser - visuelle, concrète]",
  "typologieAT": "[Ce que ce texte/thème représente dans l'Ancien Testament]",
  "typologieNT": "[Comment cela s'accomplit dans le Christ et l'Église]",
  "versetsCles": ["verset1 - texte", "verset2 - texte"],
  "apologetiqueVerite": "[Quelle doctrine catholique ce verset soutient]",
  "apologetiqueVersetsAppui": ["ref1", "ref2"],
  "apologetiqueObjection": "[Une objection courante protestante ou sceptique]",
  "apologetiqueReponse": "[Réponse biblique catholique, sans agressivité]",
  "placeHistoireSalut": "[Pourquoi ce passage est un fondement/charnière/annonce/accomplissement - 2-3 phrases]",
  "applicationSpirituelle": "[1 ligne: lien avec la vie chrétienne concrète]",
  "resumeMemoriel": "[5-10 mots maximum]",
  "astuceMemoire": "[Phrase déclencheur courte]"
}

RÈGLES:
- Fidélité absolue à la Bible catholique et au Magistère
- Apologétique non agressive, respectueuse
- Contenu mémorisable et pédagogique
- Réponse UNIQUEMENT en JSON valide, sans texte avant ou après`;

// Action: Generate fiche using Gemini API (runs on server)
export const generateFiche = action({
    args: {
        verseId: v.string(),
        book: v.string(),
        chapter: v.number(),
        verse: v.number(),
        verseText: v.string(),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not configured. Please add it to your Convex environment variables.");
        }

        const prompt = `${METAPROMPT}

VERSET À ANALYSER:
${args.book} ${args.chapter}:${args.verse}
"${args.verseText}"

Génère la fiche MEMORIA FIDEI complète en JSON:`;

        try {
            // Call Gemini API
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
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 4096,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Gemini API error: ${error}`);
            }

            const data = await response.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!generatedText) {
                throw new Error("No response from Gemini");
            }

            // Extract JSON from response (handle markdown code blocks)
            let jsonStr = generatedText;
            if (jsonStr.includes("```json")) {
                jsonStr = jsonStr.split("```json")[1].split("```")[0];
            } else if (jsonStr.includes("```")) {
                jsonStr = jsonStr.split("```")[1].split("```")[0];
            }

            const ficheData = JSON.parse(jsonStr.trim());

            // Save to database
            await ctx.runMutation("verseFiches:saveFiche" as any, {
                verseId: args.verseId,
                book: args.book,
                chapter: args.chapter,
                verse: args.verse,
                verseText: args.verseText,
                ...ficheData,
            });

            return ficheData;
        } catch (error) {
            console.error("Error generating fiche:", error);
            throw error;
        }
    },
});
