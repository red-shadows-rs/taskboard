import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { env, pipeline } from "@huggingface/transformers";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");

const config = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "translation.config.json"), "utf-8"),
);

const modelsDir = process.env.TRANSLATION_MODELS_DIR
  ? path.resolve(process.cwd(), process.env.TRANSLATION_MODELS_DIR)
  : path.resolve(process.cwd(), config.modelsDir);

env.cacheDir = modelsDir;
env.allowRemoteModels = true;
env.allowLocalModels = true;

const SAMPLES = [
  { text: "مرحبا بالعالم", src: config.flores.ar, tgt: config.flores.en },
  { text: "Hello world", src: config.flores.en, tgt: config.flores.ar },
];

async function main() {
  console.log(`Downloading translation model into: ${modelsDir}`);

  process.stdout.write(`- ${config.modelId} ... `);
  try {
    const translator = await pipeline("translation", config.modelId, {
      dtype: config.dtype,
    });

    for (const sample of SAMPLES) {
      const output = await translator(sample.text, {
        src_lang: sample.src,
        tgt_lang: sample.tgt,
        max_new_tokens: 32,
      });
      const first = Array.isArray(output) ? output[0] : output;
      console.log(
        `\n  ${sample.src}->${sample.tgt}: ${first?.translation_text}`,
      );
    }

    console.log("ok");
  } catch (error) {
    console.log("failed");
    throw error;
  }

  console.log("Done. Model is cached locally and used offline at runtime.");
}

main().catch((error) => {
  console.error("\nModel download failed:");
  console.error(error);
  process.exit(1);
});
