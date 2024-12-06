import { client } from "./client";

export async function wipeMemories() {
    await client.deleteAll({ agent_id: "satoshi" });
    console.log("Memories wiped");
}

wipeMemories();