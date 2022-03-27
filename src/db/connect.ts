import logger from "../logger";
import mongoose from "mongoose";

const connect = async () => {
  const url: string = process.env.DB_URI as string;
  mongoose.connect(url);
  mongoose.pluralize(null);
  mongoose.connection.once("open", () => {
    logger.info("Connected to database");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("Error connecting to database...", err);
    process.exit();
  });
};

const disconnect = () => {
  if (!mongoose.connection) {
    return;
  }
  mongoose.disconnect();
  mongoose.connection.once("close", async () => {
    console.log("Diconnected  to database");
  });
};

export { connect, disconnect };
