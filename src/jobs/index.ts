import { mangaListObj } from 'interfaces';

export const jobs = [];

export const updateAllManga = async (mangaList: mangaListObj[]) => {
  for (const manga in mangaList) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(1000);
  }
};
