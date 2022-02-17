import { Express, Request, Response } from "express";
import logger from "./logger";

import { getOneManga } from "./scripts/scraper";
import { mangaList, chapterSchedule, welcomeMessage } from "./db/memory";

export default function (app: Express) {
  // Health Check & Welcome Message
  app.get("/", (req: Request, res: Response) => {
    try {
      res.send(welcomeMessage);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  // GET - Returns a list of all manga. Default sort is by most recent chapter release
  app.get("/v1/manga", async (req: Request, res: Response) => {
    try {
      res.send(mangaList);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  // GET - Returns a list of all upcoming manga. Default sort starts at today's release
  app.get("/v1/schedule", async (req: Request, res: Response) => {
    try {
      res.send(chapterSchedule);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

  // GET - Returns data on a single manga
  app.get(
    "/v1/manga/:mangaID",
    async (req: Request<{ mangaID: "string" }>, res: Response) => {
      const { mangaID } = req.params;
      if (!mangaID) res.status(400).send({ msg: "Manga ID required" });
      try {
        getOneManga(mangaID)
          .then((response) => {
            return res.send(response);
          })
          .catch((error) => logger.info(error));
      } catch (error) {
        return res.status(500).send(error);
      }
    }
  );

  app.post("/v1/manga", async (req: Request, res: Response) => {
    const { mangaData } = req.body;
    const apiKey = req.headers.authorization;
    if (apiKey !== process.env.API_KEY) {
      getOneManga(mangaData)
        .then((response) => {
          return res.send(response);
        })
        .catch((error) => {
          logger.info(error);
          return res.status(500).send(error);
        });
    }
  });
}
