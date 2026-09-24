import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ url: "http://localhost:4001/graphql", token: "15891cbea3de5596b9b528ac7c6a1fe87fe506e0", queries,  });
export default client;
  