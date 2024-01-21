// シェルから受け取った第一引数のファイルを読み込み、特定の文字列パターンの存在を確認するスクリプト
// 例: node scripts/checkResolved.ts dist/index.js

import fs from "node:fs";

const pattern = /"##\//g;

const fileName = process.argv[2];

if (!fs.existsSync(fileName)) {
  console.error(`${fileName} does not exist`);
  process.exitCode = 1;
  process.exit();
}

const content = fs.readFileSync(fileName, "utf8");
const matches = content.matchAll(pattern);

for (const match of matches) {
  const matchedIndex = match.index as number;
  // matchedIndexの前後の改行を探し、その間の文字列を取得する
  const before = content.lastIndexOf("\n", matchedIndex);
  const after = content.indexOf("\n", matchedIndex);
  const line = content.substring(before + 1, after);
  console.error(`${fileName}:${matchedIndex}\n${line}`);
  process.exitCode = 1;
}
