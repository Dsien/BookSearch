import express from "express";
import path from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from 'url';
import db from "./config/connection.js";
import { Request, Response } from "express";

import { ApolloServer } from "@apollo/server";
import { typeDefs, resolvers } from "./schemas/index.js";
import { expressMiddleware } from "@apollo/server/express4";
import { authenticateToken } from "./services/auth.js";

// recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();
  await db();

  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(server as any, {
      context: authenticateToken as any,
    })
  );

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../client/dist")));

    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

startApolloServer();