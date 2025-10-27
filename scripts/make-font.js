// scripts/make-font.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⬇️ 경로를 "VariableFont_wght.ttf"로 변경
const input = path.resolve(__dirname, "../src/fonts/NotoSansKR-VariableFont_wght.ttf");
const out = path.resolve(__dirname, "../src/fonts/NotoSansKR-Variable.base64.js");

const data = fs.readFileSync(input).toString("base64");

const js = `// auto-generated
export const NOTO_SANS_KR_BASE64 = '${data}';
`;
fs.writeFileSync(out, js, "utf8");
console.log("✅ Generated:", out);
