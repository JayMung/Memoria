import { mutation } from "./_generated/server";

// Simple structure of books with chapter counts (from public/bible/books.json)
const BOOKS = [
    { id: "genese", name: "Genèse", chapters: 50 },
    { id: "exode", name: "Exode", chapters: 40 },
    { id: "levitique", name: "Lévitique", chapters: 27 },
    { id: "nombres", name: "Nombres", chapters: 36 },
    { id: "deuteronome", name: "Deutéronome", chapters: 34 },
    { id: "josue", name: "Josué", chapters: 24 },
    { id: "juges", name: "Juges", chapters: 21 },
    { id: "ruth", name: "Ruth", chapters: 4 },
    { id: "1_samuel", name: "1 Samuel", chapters: 31 },
    { id: "2_samuel", name: "2 Samuel", chapters: 24 },
    { id: "1_rois", name: "1 Rois", chapters: 22 },
    { id: "2_rois", name: "2 Rois", chapters: 25 },
    { id: "1_chroniques", name: "1 Chroniques", chapters: 29 },
    { id: "2_chroniques", name: "2 Chroniques", chapters: 36 },
    { id: "esdras", name: "Esdras", chapters: 10 },
    { id: "nehemie", name: "Néhémie", chapters: 13 },
    { id: "esther", name: "Esther", chapters: 10 },
    { id: "job", name: "Job", chapters: 42 },
    { id: "psaumes", name: "Psaumes", chapters: 150 },
    { id: "proverbes", name: "Proverbes", chapters: 31 },
    { id: "ecclesiaste", name: "Ecclésiaste", chapters: 12 },
    { id: "cantique_des_cantiques", name: "Cantique des Cantiques", chapters: 8 },
    { id: "esaie", name: "Ésaïe", chapters: 66 },
    { id: "jeremie", name: "Jérémie", chapters: 52 },
    { id: "lamentations", name: "Lamentations", chapters: 5 },
    { id: "ezechiel", name: "Ézéchiel", chapters: 48 },
    { id: "daniel", name: "Daniel", chapters: 12 },
    { id: "osee", name: "Osée", chapters: 14 },
    { id: "joel", name: "Joël", chapters: 3 },
    { id: "amos", name: "Amos", chapters: 9 },
    { id: "abdias", name: "Abdias", chapters: 1 },
    { id: "jonas", name: "Jonas", chapters: 4 },
    { id: "michee", name: "Michée", chapters: 7 },
    { id: "nahum", name: "Nahum", chapters: 3 },
    { id: "habacuc", name: "Habacuc", chapters: 3 },
    { id: "sophonie", name: "Sophonie", chapters: 3 },
    { id: "aggee", name: "Aggée", chapters: 2 },
    { id: "zacharie", name: "Zacharie", chapters: 14 },
    { id: "malachie", name: "Malachie", chapters: 4 },
    // NT
    { id: "matthieu", name: "Matthieu", chapters: 28 },
    { id: "marc", name: "Marc", chapters: 16 },
    { id: "luc", name: "Luc", chapters: 24 },
    { id: "jean", name: "Jean", chapters: 21 },
    { id: "actes", name: "Actes", chapters: 28 },
    { id: "romains", name: "Romains", chapters: 16 },
    { id: "1_corinthiens", name: "1 Corinthiens", chapters: 16 },
    { id: "2_corinthiens", name: "2 Corinthiens", chapters: 13 },
    { id: "galates", name: "Galates", chapters: 6 },
    { id: "ephesians", name: "Éphésiens", chapters: 6 },
    { id: "philippiens", name: "Philippiens", chapters: 4 },
    { id: "colossiens", name: "Colossiens", chapters: 4 },
    { id: "1_thessaloniciens", name: "1 Thessaloniciens", chapters: 5 },
    { id: "2_thessaloniciens", name: "2 Thessaloniciens", chapters: 3 },
    { id: "1_timothee", name: "1 Timothée", chapters: 6 },
    { id: "2_timothee", name: "2 Timothée", chapters: 4 },
    { id: "tite", name: "Tite", chapters: 3 },
    { id: "philemon", name: "Philémon", chapters: 1 },
    { id: "hebreux", name: "Hébreux", chapters: 13 },
    { id: "jacques", name: "Jacques", chapters: 5 },
    { id: "1_pierre", name: "1 Pierre", chapters: 5 },
    { id: "2_pierre", name: "2 Pierre", chapters: 3 },
    { id: "1_jean", name: "1 Jean", chapters: 5 },
    { id: "2_jean", name: "2 Jean", chapters: 1 },
    { id: "3_jean", name: "3 Jean", chapters: 1 },
    { id: "jude", name: "Jude", chapters: 1 },
    { id: "apocalypse", name: "Apocalypse", chapters: 22 }
];

export const seedFullPlan = mutation({
    args: {},
    handler: async (ctx) => {
        // Clear existing
        const existing = await ctx.db.query("readingPlan").collect();
        for (const doc of existing) await ctx.db.delete(doc._id);

        let currentDay = 1;
        let plan: any[] = [];
        let bookIndex = 0;
        let chapterIndex = 1;

        // Iterate 365 days
        while (currentDay <= 365) {
            let readings = [];

            // Assign 1-2 Narrative/OT chapters
            let dailyChapters = 0;
            while (dailyChapters < 3 && bookIndex < BOOKS.length) {
                const book = BOOKS[bookIndex];

                // Determine range (e.g. 1-2, 3, etc.)
                // Just take 2-3 chapters to fill the day
                let chaptersToTake = 3; // Aggressive pace to finish
                if (book.chapters - chapterIndex + 1 < chaptersToTake) {
                    chaptersToTake = book.chapters - chapterIndex + 1;
                }

                const endChapter = chapterIndex + chaptersToTake - 1;
                const range = chapterIndex === endChapter ? `${chapterIndex}` : `${chapterIndex}-${endChapter}`;

                readings.push({
                    book: book.name,
                    chapter: range,
                    type: "narrative" // Simplified type
                });

                chapterIndex += chaptersToTake;
                dailyChapters += chaptersToTake;

                // Next book?
                if (chapterIndex > book.chapters) {
                    bookIndex++;
                    chapterIndex = 1;
                }
            }

            // Add a Psalm every day (cycling)
            const psalmNum = (currentDay % 150) || 150;
            readings.push({
                book: "Psaumes",
                chapter: `${psalmNum}`,
                type: "prayer"
            });

            // Period logic (simplified)
            let period = "L'Alliance";
            if (currentDay < 50) period = "Les Débuts";
            else if (currentDay < 100) period = "Exode & Conquête";
            else if (currentDay < 200) period = "Royaume & Prophètes";
            else if (currentDay < 300) period = "Exil & Retour";
            else period = "Messie & Église";

            await ctx.db.insert("readingPlan", {
                day: currentDay,
                period,
                readings
            });

            currentDay++;
        }

        return `Generated ${currentDay - 1} days of reading plan.`;
    }
});
