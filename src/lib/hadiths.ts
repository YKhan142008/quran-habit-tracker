// lib/hadiths.ts

export type Hadith = {
  id: string;
  arabic: string;
  translation: string;
  source: string;
  theme: 'quran' | 'consistency' | 'reward';
};

export const hadiths: Hadith[] = [
  {
    id: 'bukhari_6464',
    arabic: 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    translation: 'The most beloved of deeds to Allah are those that are most consistent, even if it is small.',
    source: 'Sahih al-Bukhari 6464',
    theme: 'consistency',
  },
  {
    id: 'muslim_803',
    arabic: 'اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لأَصْحَابِهِ',
    translation: 'Read the Qur\'an, for verily it will come on the Day of Standing as an intercessor for its companions.',
    source: 'Sahih Muslim 803',
    theme: 'quran',
  },
  {
    id: 'tirmidhi_2910',
    arabic: 'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا',
    translation: 'Whoever recites a letter from the Book of Allah will receive a reward, and each reward is multiplied by ten.',
    source: 'Jami\' at-Tirmidhi 2910',
    theme: 'reward',
  },
  {
    id: 'bukhari_5027',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translation: 'The best among you are those who learn the Qur\'an and teach it to others.',
    source: 'Sahih al-Bukhari 5027',
    theme: 'quran',
  },
  {
    id: 'ibn_majah_4240',
    arabic: 'خُذُوا مِنَ الْعَمَلِ مَا تُطِيقُونَ فَإِنَّ اللَّهَ لاَ يَمَلُّ حَتَّى تَمَلُّوا وَإِنَّ أَحَبَّ الأَعْمَالِ إِلَى اللَّهِ مَا دَاوَمَ عَلَيْهِ صَاحِبُهُ وَإِنْ قَلَّ',
    translation: 'Take up good deeds only as much as you are able, for the best deeds are those done regularly even if they are few.',
    source: 'Sunan Ibn Majah 4240',
    theme: 'consistency',
  },
  {
    id: 'muslim_1910',
    arabic: 'إِنَّ الَّذِي لَيْسَ فِي جَوْفِهِ شَيْءٌ مِنَ الْقُرْآنِ كَالْبَيْتِ الْخَرِبِ',
    translation: 'Indeed, the one who does not have anything of the Qur\'an inside him is like a ruined house.',
    source: 'Sahih Muslim 1910 (variant)',
    theme: 'quran',
  },
];

/**
 * Get a random hadith
 */
export function getRandomHadith(): Hadith {
  const randomIndex = Math.floor(Math.random() * hadiths.length);
  return hadiths[randomIndex];
}

/**
 * Get a random hadith by theme
 */
export function getRandomHadithByTheme(theme: Hadith['theme']): Hadith {
  const filtered = hadiths.filter((h) => h.theme === theme);
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex] || hadiths[0]; // Fallback to first hadith
}
