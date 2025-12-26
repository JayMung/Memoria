import { ConvexHttpClient } from "convex/browser";
import * as fs from "fs";
import * as path from "path";

// Manually read .env.local to avoid dotenv dependency
function getEnvVar(key) {
    try {
        const envPath = path.join(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, "utf-8");
            const match = content.match(new RegExp(`${key}=(.*)`));
            if (match && match[1]) {
                return match[1].trim();
            }
        }
    } catch (e) {
        // ignore
    }
    return process.env[key];
}

const convexUrl = getEnvVar("VITE_CONVEX_URL");

if (!convexUrl) {
    console.error("VITE_CONVEX_URL not found in .env.local");
    process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

function generateHtml(chapterNum, verses) {
  let html = `<h3>Chapitre ${chapterNum}</h3>`;
  verses.forEach((v) => {
    html += `<p><sup class="text-amber-600 text-xs font-bold mr-1" id="v${v.v}">${v.v}</sup><span class="verse-text" data-verse="${v.v}">${v.t}</span></p>`;
  });
  return html;
}

async function main() {
  const bibleDir = path.join(process.cwd(), "public", "bible");
  const booksFile = path.join(bibleDir, "books.json");

  if (!fs.existsSync(booksFile)) {
    console.error("Books file not found:", booksFile);
    return;
  }

  const booksData = JSON.parse(fs.readFileSync(booksFile, "utf-8"));
  const allBooks = [...booksData.at, ...booksData.nt];

  console.log(`Found ${allBooks.length} books. Starting import...`);

  let batch = [];
  const BATCH_SIZE = 50;
  let totalProcessed = 0;

  for (const book of allBooks) {
    // console.log(`Processing ${book.name}...`);
    
    for (let c = 1; c <= book.chapters; c++) {
      const filename = `${book.id}_${c}.json`;
      const filePath = path.join(bibleDir, filename);

      if (fs.existsSync(filePath)) {
        const chapterData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        
        // Use matching ID format: "genesis_1" -> WAIT, seeded data uses "genesis", but files use "genese"
        // I should stick to the ID in books.json? 
        // My 'genesis1' seed uses 'genesis'. 'books.json' uses 'genese'.
        // If I change it now, I break compatibility with existing seed unless I map it.
        // The user's URL uses "genesis" because I mapped it in `Parcours.tsx` (book.name.toLowerCase() == "genèse" ? "genesis" : ...)
        // Let's decide: Use the IDs from keys in `bibleYear.ts`? 
        // In `bibleYear.ts`, keys are "Gn", "Ex" etc? No, I used full names "Genèse".
        // Let's use the ID provided in `books.json` (e.g. "genese") BUT mapped to english if needed?
        // Actually, looking at `dashbardLayout` or `Parcours`, I use "genesis" manually everywhere?
        // Let's look at `convex/seed_data.ts`... `chapterId: "genesis_1"`.
        // books.json has `id: "genese"`.
        // I should probably map "genese" -> "genesis" to handle the `ReadingSession` which expects "genesis" OR update `ReadingSession` to handle French IDs.
        // Easier: Update `ReadingSession` to accept French IDs since the whole app is French.
        // BUT `ReadingSession` currently has hardcoded checks.
        // Okay, I will just import as is (french ID) "genese_1".
        // AND I will verify `Parcours.tsx` sends the correct ID.
        
        const chapterId = `${book.id}_${c}`; 
        
        const content = generateHtml(c, chapterData.verses);

        batch.push({
            chapterId,
            book: book.name,
            chapter: c,
            content,
            periodeHistoireSalut: "Autre", 
            familleTheologique: "Bible",
        });
        
        totalProcessed++;

        if (batch.length >= BATCH_SIZE) {
            await processBatch(batch);
            batch = [];
        }
      }
    }
  }

  if (batch.length > 0) {
    await processBatch(batch);
  }

  console.log(`Import complete! ${totalProcessed} chapters processed.`);
}

async function processBatch(batch) {
    process.stdout.write(".");
    try {
        await client.mutation("memoria:insertBatch", { chapters: batch });
    } catch (e) {
        console.error("\nError sending batch:", e);
    }
}

main().catch(console.error);
