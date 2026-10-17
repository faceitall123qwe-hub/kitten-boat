import { Client } from "@gradio/client";
import { existsSync, writeFileSync } from "node:fs";

const STYLE = "Pixar style 3D animation render, vibrant saturated pleasant colors, soft warm sunlight, cinematic, highly detailed, joyful";
const KITTEN = "extremely cute small fluffy orange kitten with huge expressive round green eyes and white muzzle";
const BOAT = "tiny wooden rowboat";
const DUCKS = "tiny fluffy yellow ducklings with orange beaks";

const SCENES = {
  s2: `${STYLE}. Wide shot, ${KITTEN} rowing a ${BOAT} with two small oars down a beautiful sunny river, small water splashes near oars, lush green trees on banks, blue sky, sparkling sun reflections on water`,
  s3: `${STYLE}. ${KITTEN} sitting in a ${BOAT} smiling at two ${DUCKS} swimming right next to the boat, ducklings looking up and smiling, sunny river, close shot`,
  s4: `${STYLE}. Underwater view looking up at the bottom of a small wooden rowboat floating on the surface, many small colorful cute tropical fish swimming below, god rays of sunlight through clear blue-green water, bubbles`,
  s5: `${STYLE}. ${KITTEN} rowing a ${BOAT} under a beautiful old mossy stone arch bridge on a river, two ${DUCKS} swimming behind the boat, warm light`,
  s6: `${STYLE}. Close-up of ${KITTEN} in a ${BOAT} looking with surprised wide eyes at a beautiful blue butterfly flying right in front of its nose, very bright glowing sunlight, river background`,
  s7: `${STYLE}. Close-up, ${KITTEN} happily smiling and rowing a ${BOAT}, ${DUCKS} swimming on both sides of the boat, beautiful sunny river background with bokeh`,
  s8: `${STYLE}. Wide shot from behind, ${BOAT} with ${KITTEN} sailing away down a wide river toward a golden sunset, kitten turned back waving its paw, three ${DUCKS} swimming beside, low sun on horizon, golden reflection on water`,
};

const c = await Client.connect("black-forest-labs/FLUX.1-schnell");
for (const [id, prompt] of Object.entries(SCENES)) {
  if (existsSync(`stills/${id}.webp`)) continue;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await c.predict("/infer", { prompt, seed: 42, randomize_seed: false, width: 768, height: 1344, num_inference_steps: 4 });
      writeFileSync(`stills/${id}.webp`, Buffer.from(await (await fetch(r.data[0].url)).arrayBuffer()));
      console.log(id, "ok");
      break;
    } catch (e) {
      console.log(id, "fail", e.message ?? e);
    }
  }
}
process.exit(0);
