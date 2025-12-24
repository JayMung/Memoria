/**
 * Script to convert Bible JSON from scrollmapper format to Memoria Fidei format
 * 
 * Source format: { translation, books: [{ name, chapters: [{ chapter, verses: [{ verse, text }] }] }] }
 * Target format: { book, chapter, verses: [{ v, t }] }
 */

const fs = require('fs');
const path = require('path');

// Map of book names to our IDs
const bookMapping = {
  // AT - Pentateuque
  'Genesis': { id: 'genese', name: 'Genèse' },
  'Exodus': { id: 'exode', name: 'Exode' },
  'Leviticus': { id: 'levitique', name: 'Lévitique' },
  'Numbers': { id: 'nombres', name: 'Nombres' },
  'Deuteronomy': { id: 'deuteronome', name: 'Deutéronome' },
  
  // AT - Historiques
  'Joshua': { id: 'josue', name: 'Josué' },
  'Judges': { id: 'juges', name: 'Juges' },
  'Ruth': { id: 'ruth', name: 'Ruth' },
  '1 Samuel': { id: '1samuel', name: '1 Samuel' },
  'I Samuel': { id: '1samuel', name: '1 Samuel' },
  '2 Samuel': { id: '2samuel', name: '2 Samuel' },
  'II Samuel': { id: '2samuel', name: '2 Samuel' },
  '1 Kings': { id: '1rois', name: '1 Rois' },
  'I Kings': { id: '1rois', name: '1 Rois' },
  '2 Kings': { id: '2rois', name: '2 Rois' },
  'II Kings': { id: '2rois', name: '2 Rois' },
  '1 Chronicles': { id: '1chroniques', name: '1 Chroniques' },
  'I Chronicles': { id: '1chroniques', name: '1 Chroniques' },
  '2 Chronicles': { id: '2chroniques', name: '2 Chroniques' },
  'II Chronicles': { id: '2chroniques', name: '2 Chroniques' },
  'Ezra': { id: 'esdras', name: 'Esdras' },
  'Nehemiah': { id: 'nehemie', name: 'Néhémie' },
  
  // AT - Deutérocanoniques
  'Tobit': { id: 'tobie', name: 'Tobie' },
  'Judith': { id: 'judith', name: 'Judith' },
  'Esther': { id: 'esther', name: 'Esther' },
  '1 Maccabees': { id: '1maccabees', name: '1 Maccabées' },
  'I Maccabees': { id: '1maccabees', name: '1 Maccabées' },
  '2 Maccabees': { id: '2maccabees', name: '2 Maccabées' },
  'II Maccabees': { id: '2maccabees', name: '2 Maccabées' },
  
  // AT - Poétiques/Sagesse
  'Job': { id: 'job', name: 'Job' },
  'Psalms': { id: 'psaumes', name: 'Psaumes' },
  'Proverbs': { id: 'proverbes', name: 'Proverbes' },
  'Ecclesiastes': { id: 'ecclesiaste', name: 'Ecclésiaste' },
  'Song of Solomon': { id: 'cantique', name: 'Cantique des Cantiques' },
  'Wisdom': { id: 'sagesse', name: 'Sagesse' },
  'Sirach': { id: 'siracide', name: 'Siracide' },
  
  // AT - Prophètes
  'Isaiah': { id: 'isaie', name: 'Isaïe' },
  'Jeremiah': { id: 'jeremie', name: 'Jérémie' },
  'Lamentations': { id: 'lamentations', name: 'Lamentations' },
  'Baruch': { id: 'baruch', name: 'Baruch' },
  'Ezekiel': { id: 'ezechiel', name: 'Ézéchiel' },
  'Daniel': { id: 'daniel', name: 'Daniel' },
  'Hosea': { id: 'osee', name: 'Osée' },
  'Joel': { id: 'joel', name: 'Joël' },
  'Amos': { id: 'amos', name: 'Amos' },
  'Obadiah': { id: 'abdias', name: 'Abdias' },
  'Jonah': { id: 'jonas', name: 'Jonas' },
  'Micah': { id: 'michee', name: 'Michée' },
  'Nahum': { id: 'nahum', name: 'Nahum' },
  'Habakkuk': { id: 'habacuc', name: 'Habacuc' },
  'Zephaniah': { id: 'sophonie', name: 'Sophonie' },
  'Haggai': { id: 'aggee', name: 'Aggée' },
  'Zechariah': { id: 'zacharie', name: 'Zacharie' },
  'Malachi': { id: 'malachie', name: 'Malachie' },
  
  // NT
  'Matthew': { id: 'matthieu', name: 'Matthieu' },
  'Mark': { id: 'marc', name: 'Marc' },
  'Luke': { id: 'luc', name: 'Luc' },
  'John': { id: 'jean', name: 'Jean' },
  'Acts': { id: 'actes', name: 'Actes des Apôtres' },
  'Romans': { id: 'romains', name: 'Romains' },
  '1 Corinthians': { id: '1corinthiens', name: '1 Corinthiens' },
  'I Corinthians': { id: '1corinthiens', name: '1 Corinthiens' },
  '2 Corinthians': { id: '2corinthiens', name: '2 Corinthiens' },
  'II Corinthians': { id: '2corinthiens', name: '2 Corinthiens' },
  'Galatians': { id: 'galates', name: 'Galates' },
  'Ephesians': { id: 'ephesiens', name: 'Éphésiens' },
  'Philippians': { id: 'philippiens', name: 'Philippiens' },
  'Colossians': { id: 'colossiens', name: 'Colossiens' },
  '1 Thessalonians': { id: '1thessaloniciens', name: '1 Thessaloniciens' },
  'I Thessalonians': { id: '1thessaloniciens', name: '1 Thessaloniciens' },
  '2 Thessalonians': { id: '2thessaloniciens', name: '2 Thessaloniciens' },
  'II Thessalonians': { id: '2thessaloniciens', name: '2 Thessaloniciens' },
  '1 Timothy': { id: '1timothee', name: '1 Timothée' },
  'I Timothy': { id: '1timothee', name: '1 Timothée' },
  '2 Timothy': { id: '2timothee', name: '2 Timothée' },
  'II Timothy': { id: '2timothee', name: '2 Timothée' },
  'Titus': { id: 'tite', name: 'Tite' },
  'Philemon': { id: 'philemon', name: 'Philémon' },
  'Hebrews': { id: 'hebreux', name: 'Hébreux' },
  'James': { id: 'jacques', name: 'Jacques' },
  '1 Peter': { id: '1pierre', name: '1 Pierre' },
  'I Peter': { id: '1pierre', name: '1 Pierre' },
  '2 Peter': { id: '2pierre', name: '2 Pierre' },
  'II Peter': { id: '2pierre', name: '2 Pierre' },
  '1 John': { id: '1jean', name: '1 Jean' },
  'I John': { id: '1jean', name: '1 Jean' },
  '2 John': { id: '2jean', name: '2 Jean' },
  'II John': { id: '2jean', name: '2 Jean' },
  '3 John': { id: '3jean', name: '3 Jean' },
  'III John': { id: '3jean', name: '3 Jean' },
  'Jude': { id: 'jude', name: 'Jude' },
  'Revelation': { id: 'apocalypse', name: 'Apocalypse' },
  'Revelation of John': { id: 'apocalypse', name: 'Apocalypse' },
};

// Read source file
const sourceFile = process.argv[2] || 'temp_bible/formats/json/CPDV.json';
const outputDir = process.argv[3] || 'public/bible';

console.log(`Reading ${sourceFile}...`);
const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

console.log(`Translation: ${sourceData.translation}`);
console.log(`Books found: ${sourceData.books.length}`);

let chaptersCreated = 0;

sourceData.books.forEach(book => {
  const mapping = bookMapping[book.name];
  
  if (!mapping) {
    console.log(`⚠️ Unknown book: ${book.name}`);
    return;
  }
  
  book.chapters.forEach(chapter => {
    const outputFile = path.join(outputDir, `${mapping.id}_${chapter.chapter}.json`);
    
    const convertedData = {
      book: mapping.name,
      chapter: chapter.chapter,
      verses: chapter.verses.map(v => ({
        v: v.verse,
        t: v.text.trim()
      }))
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(convertedData, null, 2), 'utf8');
    chaptersCreated++;
  });
  
  console.log(`✅ ${mapping.name}: ${book.chapters.length} chapters`);
});

console.log(`\n🎉 Done! Created ${chaptersCreated} chapter files in ${outputDir}`);
