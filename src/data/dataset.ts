import { ContentRecord } from '../types/content';

// Comprehensive realistic content title templates, genres, countries, and creators
const MOVIE_NOUNS = [
  'Chronicles', 'Shadow', 'Horizon', 'Legacy', 'Echo', 'Kingdom', 'Protocol', 'Conspiracy',
  'Voyage', 'Vengeance', 'Paradox', 'Mirage', 'Requiem', 'Frontier', 'Odyssey', 'Awakening',
  'Labyrinth', 'Sanctuary', 'Enigma', 'Redemption', 'Spectrum', 'Empire', 'Heist', 'Destiny',
  'Solitude', 'Genesis', 'Nemesis', 'Prophecy', 'Eclipse', 'Symphony', 'Ascension', 'Fugitive',
  'Signal', 'Threshold', 'Cipher', 'Vanguard', 'Velocity', 'Midnight', 'Whisper', 'Illusion',
  'Riptide', 'Dynasty', 'Summit', 'Reckoning', 'Oasis', 'Inferno', 'Tide', 'Garrison'
];

const TV_NOUNS = [
  'Files', 'Chronicles', 'Protocol', 'Detectives', 'Affair', 'Station', 'District', 'Squad',
  'Dynasty', 'Order', 'Project', 'Division', 'Bureau', 'Network', 'Syndicate', 'Archive',
  'Hollow', 'Crossing', 'Heights', 'Tales', 'Legacy', 'Pact', 'Manor', 'Unit', 'Watch',
  'Covenant', 'Edge', 'Quarter', 'Frontier', 'Session', 'Outpost', 'Runners', 'Agency'
];

const ADJECTIVES = [
  'Silent', 'Dark', 'Broken', 'Hidden', 'Eternal', 'Lost', 'Crimson', 'Midnight', 'Frozen',
  'Golden', 'Iron', 'Savage', 'Fallen', 'Velvet', 'Dangerous', 'Invisible', 'Neon', 'Parallel',
  'Forgotten', 'Twisted', 'Secret', 'Infinite', 'Last', 'Reckless', 'Astral', 'Untamed',
  'Fierce', 'Urban', 'Obsidian', 'Solar', 'Phantom', 'Submerged', 'Restless', 'Electric'
];

const DIRECTORS = [
  'Christopher Nolan', 'Denis Villeneuve', 'Martin Scorsese', 'Greta Gerwig', 'Bong Joon-ho',
  'Guillermo del Toro', 'Alfonso Cuarón', 'David Fincher', 'Steven Spielberg', 'Ridley Scott',
  'Chloe Zhao', 'Taika Waititi', 'Damien Chazelle', 'Wes Anderson', 'Jordan Peele',
  'Park Chan-wook', 'Hayao Miyazaki', 'Pedro Almodóvar', 'Alejandro G. Iñárritu', 'Jane Campion',
  'Lana Wachowski', 'Spike Lee', 'Ava DuVernay', 'Yorgos Lanthimos', 'Céline Sciamma',
  'S.S. Rajamouli', 'Anurag Kashyap', 'Zoya Akhtar', 'Hirokazu Kore-eda', 'Matteo Garrone',
  'Justine Triet', 'Thomas Vinterberg', 'Paolo Sorrentino', 'Alice Rohrwacher', 'Ruben Östlund'
];

const ACTORS = [
  'Leonardo DiCaprio', 'Cillian Murphy', 'Florence Pugh', 'Zendaya', 'Timothée Chalamet',
  'Michael B. Jordan', 'Margot Robbie', 'Emma Stone', 'Daniel Kaluuya', 'Oscar Isaac',
  'Song Kang-ho', 'Bae Doona', 'Pedro Pascal', 'Penélope Cruz', 'Javier Bardem',
  'Shah Rukh Khan', 'Deepika Padukone', 'Ranbir Kapoor', 'Priyanka Chopra', 'Nawazuddin Siddiqui',
  'Ken Watanabe', 'Hiroyuki Sanada', 'Lea Seydoux', 'Vincent Cassel', 'Mads Mikkelsen',
  'Gillian Anderson', 'David Harbour', 'Sarah Snook', 'Jeremy Strong', 'Brian Cox',
  'Lupita Nyong\'o', 'Dev Patel', 'Idris Elba', 'Ana de Armas', 'Mahershala Ali'
];

const COUNTRIES_WEIGHTED = [
  { name: 'United States', weight: 34 },
  { name: 'India', weight: 16 },
  { name: 'United Kingdom', weight: 11 },
  { name: 'South Korea', weight: 8 },
  { name: 'Japan', weight: 7 },
  { name: 'Canada', weight: 5 },
  { name: 'France', weight: 5 },
  { name: 'Germany', weight: 4 },
  { name: 'Spain', weight: 4 },
  { name: 'Australia', weight: 3 },
  { name: 'Brazil', weight: 2 },
  { name: 'Mexico', weight: 2 },
  { name: 'Italy', weight: 2 },
  { name: 'Nigeria', weight: 2 },
  { name: 'Turkey', weight: 2 },
  { name: 'Sweden', weight: 1 },
  { name: 'Argentina', weight: 1 }
];

const GENRES_LIST = [
  'Drama',
  'Comedy',
  'Action & Adventure',
  'Documentary',
  'Thriller & Mystery',
  'Sci-Fi & Fantasy',
  'Romance',
  'Crime',
  'Kids & Family',
  'Horror',
  'Animation & Anime',
  'Stand-Up Comedy',
  'International & Arthouse',
  'Music & Musical'
];

const RATINGS = [
  { rating: 'TV-MA', weight: 32 },
  { rating: 'TV-14', weight: 28 },
  { rating: 'R', weight: 15 },
  { rating: 'PG-13', weight: 12 },
  { rating: 'TV-PG', weight: 7 },
  { rating: 'PG', weight: 4 },
  { rating: 'TV-G', weight: 2 }
];

const PLATFORMS = [
  'StreamScope Plus',
  'StreamScope Global',
  'Studio Vault',
  'CineMax Prime',
  'Pulse Originals'
];

const LANGUAGES = [
  'English', 'Hindi', 'Spanish', 'Korean', 'Japanese', 'French',
  'German', 'Portuguese', 'Italian', 'Turkish', 'Mandarin'
];

// Seeded deterministic pseudo-random number generator (LCG)
function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getRandomFromWeighted<T extends { weight: number }>(items: T[], rand: () => number): T {
  const total = items.reduce((acc, curr) => acc + curr.weight, 0);
  let threshold = rand() * total;
  for (const item of items) {
    threshold -= item.weight;
    if (threshold <= 0) return item;
  }
  return items[items.length - 1];
}

// Generate the canonical 8,600+ records dataset
export function generateRealisticDataset(): ContentRecord[] {
  const rng = createSeededRandom(429184);
  const TOTAL_RECORDS = 8650;
  const records: ContentRecord[] = [];

  for (let i = 1; i <= TOTAL_RECORDS; i++) {
    const isMovie = rng() < 0.68; // ~68% Movies, 32% TV Shows (matches real OTT catalog ratios)
    const type = isMovie ? 'Movie' : 'TV Show';
    const show_id = `s${i.toString().padStart(5, '0')}`;

    // Title generation
    const adj = ADJECTIVES[Math.floor(rng() * ADJECTIVES.length)];
    const noun = isMovie
      ? MOVIE_NOUNS[Math.floor(rng() * MOVIE_NOUNS.length)]
      : TV_NOUNS[Math.floor(rng() * TV_NOUNS.length)];
    const titleVariant = rng();
    let title = '';
    if (titleVariant < 0.45) {
      title = `The ${adj} ${noun}`;
    } else if (titleVariant < 0.75) {
      title = `${adj} ${noun}`;
    } else if (titleVariant < 0.90) {
      title = `${noun}: Part ${Math.floor(rng() * 3) + 1}`;
    } else {
      title = `${noun} of Tomorrow`;
    }

    // Release year & Date added distribution (Heavy concentration in 2016-2023)
    const yearRoll = rng();
    let release_year: number;
    if (yearRoll < 0.05) {
      release_year = Math.floor(1985 + rng() * 15); // 1985 - 1999
    } else if (yearRoll < 0.20) {
      release_year = Math.floor(2000 + rng() * 10); // 2000 - 2009
    } else if (yearRoll < 0.55) {
      release_year = Math.floor(2010 + rng() * 8);  // 2010 - 2017
    } else {
      release_year = Math.floor(2018 + rng() * 7);  // 2018 - 2024
    }

    // Date added is usually at or after release year, mainly between 2015 and 2024
    const addedYear = Math.min(2024, Math.max(release_year, Math.floor(2015 + rng() * 10)));
    const addedMonth = Math.floor(rng() * 12) + 1;
    const addedDay = Math.floor(rng() * 28) + 1;
    const date_added = `${addedYear}-${addedMonth.toString().padStart(2, '0')}-${addedDay.toString().padStart(2, '0')}`;

    // Country with data quality: ~4.5% unrecorded/null for analytics audit
    const hasCountry = rng() > 0.045;
    const country = hasCountry ? getRandomFromWeighted(COUNTRIES_WEIGHTED, rng).name : '';

    // Language correlation with country
    let language = 'English';
    if (country === 'India') language = 'Hindi';
    else if (country === 'South Korea') language = 'Korean';
    else if (country === 'Japan') language = 'Japanese';
    else if (country === 'France') language = 'French';
    else if (country === 'Germany') language = 'German';
    else if (country === 'Spain' || country === 'Mexico' || country === 'Argentina') language = 'Spanish';
    else if (country === 'Brazil') language = 'Portuguese';
    else if (country === 'Italy') language = 'Italian';
    else if (country === 'Turkey') language = 'Turkish';

    // Director with data quality: TV shows often lack single director (~35% null), movies ~8% null
    const hasDirector = isMovie ? rng() > 0.08 : rng() > 0.35;
    const director = hasDirector ? DIRECTORS[Math.floor(rng() * DIRECTORS.length)] : '';

    // Cast members
    const castCount = Math.floor(rng() * 3) + 2;
    const selectedCast: string[] = [];
    for (let c = 0; c < castCount; c++) {
      const actor = ACTORS[Math.floor(rng() * ACTORS.length)];
      if (!selectedCast.includes(actor)) selectedCast.push(actor);
    }
    const cast = selectedCast.join(', ');

    // Rating
    const hasRating = rng() > 0.008; // 0.8% missing for data cleaning demo
    const rating = hasRating ? getRandomFromWeighted(RATINGS, rng).rating : 'Unrated';

    // Genres (1 to 3 genres)
    const primaryGenre = GENRES_LIST[Math.floor(rng() * GENRES_LIST.length)];
    const genres: string[] = [primaryGenre];
    if (rng() < 0.45) {
      const secondary = GENRES_LIST[Math.floor(rng() * GENRES_LIST.length)];
      if (!genres.includes(secondary)) genres.push(secondary);
    }
    if (rng() < 0.15) {
      const tertiary = GENRES_LIST[Math.floor(rng() * GENRES_LIST.length)];
      if (!genres.includes(tertiary)) genres.push(tertiary);
    }
    const listed_in = genres.join(', ');

    // Duration
    let duration = '';
    let duration_num = 0;
    let duration_unit: 'min' | 'Season' = 'min';
    if (isMovie) {
      // Normal-ish distribution around 102 mins
      duration_num = Math.round(75 + (rng() + rng() + rng()) * 30);
      duration = `${duration_num} min`;
      duration_unit = 'min';
    } else {
      // TV shows: mostly 1-3 seasons, some up to 7
      const sRoll = rng();
      if (sRoll < 0.62) duration_num = 1;
      else if (sRoll < 0.84) duration_num = 2;
      else if (sRoll < 0.94) duration_num = 3;
      else duration_num = Math.floor(rng() * 4) + 4;
      duration = `${duration_num} Season${duration_num > 1 ? 's' : ''}`;
      duration_unit = 'Season';
    }

    // Viewer rating (Bell-curve centered around 6.7 with tail 3.2 to 9.3)
    const ratingRoll = (rng() + rng() + rng() + rng()) / 4; // mean ~0.5
    const viewer_rating = Number((4.0 + ratingRoll * 5.4).toFixed(1));

    // Popularity score (0 - 100) & Votes
    const popularity_score = Math.min(99, Math.max(12, Math.round(rng() * 60 + (viewer_rating - 5) * 8 + (release_year > 2020 ? 12 : 0))));
    const voteBase = Math.floor(Math.pow(10, 2.5 + rng() * 3.2));
    const votes = Math.min(980000, Math.max(450, Math.round(voteBase * (popularity_score / 50))));

    // Synthetic Financial fields (clearly tagged as synthetic demo fields in documentation & UI)
    // Budget between $4M and $160M for movies, $8M to $80M for TV
    const budgetMillion = isMovie
      ? Math.round(4 + rng() * 95)
      : Math.round(6 + duration_num * (rng() * 12 + 6));
    const budget = budgetMillion * 1_000_000;

    // Revenue correlation with viewer rating & popularity (some flop, some hit)
    const multiplier = (viewer_rating / 5.5) * (popularity_score / 45) * (0.4 + rng() * 1.6);
    const revenue = Math.round(budget * multiplier);
    const roi_percentage = Number((((revenue - budget) / budget) * 100).toFixed(1));

    // Platform & Status
    const platform = PLATFORMS[Math.floor(rng() * PLATFORMS.length)];
    const statusRoll = rng();
    const content_status: ContentRecord['content_status'] =
      statusRoll < 0.72 ? 'Active Catalog' : statusRoll < 0.88 ? 'Flagship Exclusive' : statusRoll < 0.96 ? 'Acquisition' : 'Archived';

    // Meaningful description
    const description = `${type === 'Movie' ? 'A gripping cinematic journey' : 'An episodic compelling saga'} set in ${country || 'an unknown realm'}, following characters caught in high-stakes circumstances spanning ${genres.join(' and ')}.`;

    records.push({
      show_id,
      type,
      title,
      director,
      cast,
      country,
      date_added,
      year_added: addedYear,
      release_year,
      rating,
      duration,
      duration_num,
      duration_unit,
      listed_in,
      genres,
      description,
      language,
      platform,
      popularity_score,
      viewer_rating,
      votes,
      budget,
      revenue,
      roi_percentage,
      content_status
    });
  }

  return records;
}

// Singleton cached dataset
let cachedDataset: ContentRecord[] | null = null;

export function getOTTDataset(): ContentRecord[] {
  if (!cachedDataset) {
    cachedDataset = generateRealisticDataset();
  }
  return cachedDataset;
}

export function generateSyntheticOTTDataset(): ContentRecord[] {
  return getOTTDataset();
}


