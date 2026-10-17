import { existsSync, readFileSync, writeFileSync } from "node:fs";

const src = readFileSync("gen-stills.mjs", "utf8");
const SCENES = eval("(() => {" + src.slice(src.indexOf("const STYLE"), src.indexOf("const c = await")) + "return SCENES; })()");
const H = { "Content-Type": "application/json", apikey: "0000000000", "Client-Agent": "kitten-boat:1:anon" };
const OUT = process.env.OUT ?? "stills";
const only = process.argv.slice(2);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jobs = {};
for (const [id, prompt] of Object.entries(SCENES)) {
  if (existsSync(`${OUT}/${id}.webp`) || (only.length && !only.includes(id))) continue;
  const r = await fetch("https://aihorde.net/api/v2/generate/async", {
    method: "POST",
    headers: H,
    body: JSON.stringify({
      prompt,
      models: [process.env.HORDE_MODEL ?? "AlbedoBase XL (SDXL)"],
      params: { width: 640, height: 1088, steps: 28, cfg_scale: 6, sampler_name: "k_dpmpp_2m", seed: "42", n: 1 },
      r2: true,
    }),
  }).then((x) => x.json());
  console.log(id, "queued", r.id ?? JSON.stringify(r));
  if (r.id) jobs[id] = r.id;
}
while (Object.keys(jobs).length) {
  await sleep(15000);
  for (const [id, jid] of Object.entries(jobs)) {
    const s = await fetch(`https://aihorde.net/api/v2/generate/check/${jid}`).then((x) => x.json());
    if (s.faulted) { console.log(id, "faulted"); delete jobs[id]; continue; }
    if (!s.done) { console.log(id, "wait", s.queue_position, s.wait_time); continue; }
    const st = await fetch(`https://aihorde.net/api/v2/generate/status/${jid}`).then((x) => x.json());
    const img = st.generations?.[0]?.img;
    if (img) {
      const buf = Buffer.from(await (await fetch(img)).arrayBuffer());
      if (!existsSync(`${OUT}/${id}.webp`)) writeFileSync(`${OUT}/${id}.webp`, buf);
      console.log(id, "ok horde");
    }
    delete jobs[id];
  }
}
