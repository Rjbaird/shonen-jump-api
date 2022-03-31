// ========== SECTION Interface ========== //

export interface recommendedMangaObj {
  title: string;
  titleSlug: string;
  link: string;
}

export interface jumpMangaObj {
  title: string;
  mangaID: string;
  jumpLink: string;
  headerImg: string;
  thumbnailImg: string;
  description: string;
  authorInfo: string;
  recommendedManga: recommendedMangaObj[];
}

export interface recommendedVizObj {
  title: string;
  titleSlug: string;
  link: string;
}

export interface vizMangaObj {
  title: string;
  mangaID: string;
  vizLink: string;
  headerImg: string;
  thumbnailImg: string;
  description: string;
  authorInfo: string;
  recommendedManga: recommendedVizObj[];
}

export interface completeMangaObj {
  title: string;
  mangaID: string;
  jumpLink: string;
  vizLink: string;
  jumpImages: string[];
  vizImages: string[];
  authorInfo: string;
  descriptionJump: string;
  descriptionViz: string;
  // recommendedManga: {
  //   jump: object[];
  //   viz: object[];
  // };
}

export interface mangaListObj {
  title: string;
  mangaID: string;
}
