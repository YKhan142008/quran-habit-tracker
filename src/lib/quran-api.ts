// src/lib/quran-api.ts

const API_BASE = 'https://api.alquran.cloud/v1';

export type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

export async function getSurahs(): Promise<Surah[]> {
  try {
    const res = await fetch(`${API_BASE}/surah`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch surahs:', error);
    return [];
  }
}

export async function getAyahCount(surahNumber: number): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/surah/${surahNumber}`);
    const data = await res.json();
    return data.data.numberOfAyahs;
  } catch (error) {
    console.error(`Failed to fetch ayah count for surah ${surahNumber}:`, error);
    return 0;
  }
}

export async function getPageForAyah(surah: number, ayah: number): Promise<number | null> {
  try {
    const res = await fetch(`${API_BASE}/ayah/${surah}:${ayah}/en.asad`); // Using a translation to get metadata
    const data = await res.json();
    return data.data.page;
  } catch (error) {
    console.error('Failed to fetch page number:', error);
    return null;
  }
}
