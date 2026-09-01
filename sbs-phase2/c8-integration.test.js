import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const productionHtml = readFileSync(new URL('../shoot.html', import.meta.url), 'utf8');

test('C8 exposes ASCENT 2.0 as an explicit opt-in while retaining the 1.5 path', () => {
  assert.match(productionHtml, /id="phase2-optin" type="checkbox"/);
  assert.match(productionHtml, /if \(document\.getElementById\('phase2-optin'\)\.checked\)/);
  assert.match(productionHtml, /await runPhase2Analysis\(\)/);
  assert.match(productionHtml, /await runMediaPipeAnalysis\(\)/);
});

test('C8 loads the completed Phase 2 modules and falls back on zero detections', () => {
  assert.match(productionHtml, /import\('\.\/sbs-phase2\/pipeline\.js'\)/);
  assert.match(productionHtml, /import\('\.\/sbs-phase2\/overlay\.js'\)/);
  assert.match(productionHtml, /detectedFrames === 0/);
  assert.match(productionHtml, /2\.0で骨格を検出できなかったため、従来解析へ切り替えます/);
});

test('C8 passes Phase 2 timeline output into the detailed AI diagnosis prompt', () => {
  assert.match(productionHtml, /【ASCENT 2\.0 動画全体解析】/);
  assert.match(productionHtml, /phase2Output\.timeline/);
  assert.match(productionHtml, /phase2Output\.peaks/);
});

test('a previous free trial blocks only free users, not paid members', () => {
  assert.match(productionHtml, /if \(trialUsed && userTier === 'free'\)/);
});
