// Echte Chromium-tests via het ingebouwde DevTools-protocol; geen npm-pakketten.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

async function until(fn, message) {
  for (let i = 0; i < 150; i++) {
    try { const result = await fn(); if (result) return result; } catch {}
    await delay(100);
  }
  throw new Error(message);
}

test('kookboek in Chromium', { timeout: 120000 }, async t => {
  const recipes = JSON.parse(await readFile(join('dist', 'data', 'recipes.json'), 'utf8'));
  const recipeCount = recipes.length;
  assert.ok(recipeCount > 0, 'De catalogus bevat recepten');
  const profile = await mkdtemp(join(tmpdir(), 'cookbook-browser-'));
  const server = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1', '--directory', 'dist'], { stdio: 'ignore' });
  const chrome = spawn(process.env.CHROME_BIN || 'chromium', ['--headless', '--no-sandbox', '--disable-dev-shm-usage', '--remote-debugging-port=9222', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  let ws;
  try {
    await until(async () => (await fetch('http://127.0.0.1:8765/')).ok, 'Website start niet');
    const target = await until(async () => (await (await fetch('http://127.0.0.1:9222/json')).json()).find(p => p.type === 'page'), 'Chromium start niet');
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    let sequence = 0;
    const pending = new Map();
    ws.onmessage = event => {
      const result = JSON.parse(event.data);
      if (!result.id) return;
      const callback = pending.get(result.id);
      pending.delete(result.id);
      if (result.error) callback.reject(new Error(JSON.stringify(result.error)));
      else callback.resolve(result.result);
    };
    const command = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async expression => {
      const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const wait = expression => until(() => evaluate(expression), expression);
    let visitNumber = 0;
    const visit = async (hash = '') => {
      await command('Page.navigate', { url: `http://127.0.0.1:8765/?test=${++visitNumber}${hash}` });
      await wait(`document.querySelectorAll(".recipe").length === ${recipeCount}`);
    };
    await command('Page.enable');
    await t.test('zoeken en keukenfilter', async () => {
      await visit();
      await evaluate('document.querySelector("#search").value="gamba"; document.querySelector("#search").dispatchEvent(new Event("input"))');
      assert.equal(await evaluate('document.querySelectorAll(".recipe").length'), 1);
      await evaluate('document.querySelector("#category").value="Italiaans"; document.querySelector("#category").dispatchEvent(new Event("change"))');
      assert.match(await evaluate('document.querySelector("#status").textContent'), /Geen recepten/);
    });
    await t.test('directe link, porties en opgeslagen vinkjes', async () => {
      await visit('#gamba-bao-buns');
      await wait('document.querySelector("#viewer").open');
      assert.match(await evaluate('document.querySelector("#recipe-title").textContent'), /Gamba/);
      await evaluate('document.querySelector(".checklist input").click()');
      await evaluate('document.querySelector("#portions").value="8"; document.querySelector("#portions").dispatchEvent(new Event("change"))');
      const bao = recipes.find(recipe => recipe.id === 'gamba-bao-buns');
      const gambas = bao.ingredients.find(ingredient => ingredient.name.startsWith('gamba'));
      const scaledGambas = [Number(gambas.quantity * 8 / bao.portions).toLocaleString('nl-NL'), gambas.unit, gambas.name].filter(Boolean).join(' ');
      assert.ok((await evaluate('document.querySelector("#detail").textContent')).includes(scaledGambas));
      assert.equal(await evaluate('document.querySelector(".checklist input").checked'), true);
      await evaluate('document.querySelector("#portions").value="0"; document.querySelector("#portions").dispatchEvent(new Event("change"))');
      assert.equal(await evaluate('document.querySelector("#portions").value'), '8');
      await command('Page.reload');
      await wait('document.querySelector("#viewer")?.open');
      assert.equal(await evaluate('document.querySelector(".checklist input").checked'), true);
      await evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent==="Vinkjes wissen").click()');
      assert.equal(await evaluate('document.querySelector(".checklist input").checked'), false);
      await evaluate('document.querySelector("#viewer").dispatchEvent(new Event("cancel", {cancelable:true}))');
      assert.equal(await evaluate('location.hash'), '');
      assert.equal(await evaluate('document.querySelector("#viewer").open'), false);
    });
    await t.test('kaart openen, terug en vooruit', async () => {
      await visit();
      await evaluate('document.querySelector(".recipe").click()');
      await wait('document.querySelector("#viewer").open');
      await evaluate('history.back()');
      await wait('!document.querySelector("#viewer").open');
      await evaluate('history.forward()');
      await wait('document.querySelector("#viewer").open');
      await evaluate('document.querySelector("#close").click()');
      assert.equal(await evaluate('location.hash'), '');
    });
    await t.test('onbekende link en geblokkeerde opslag', async () => {
      await visit('#bestaat-niet');
      assert.match(await evaluate('document.querySelector("#link-status").textContent'), /bestaat niet/);
      await evaluate('Object.defineProperty(window,"localStorage",{get(){throw Error("blocked")}}); location.hash="gamba-bao-buns"');
      await wait('document.querySelector("#viewer").open');
      await evaluate('document.querySelector(".checklist input").click()');
      assert.equal(await evaluate('document.querySelector(".checklist input").checked'), true);
    });
    await t.test('mobiele weergave en print', async () => {
      await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
      await visit('#gamba-bao-buns');
      await wait('document.querySelector("#viewer").open');
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
      assert.equal(await evaluate('document.querySelector("#viewer").scrollWidth <= document.querySelector("#viewer").clientWidth'), true);
      await evaluate('window.dispatchEvent(new Event("beforeprint"))');
      await command('Emulation.setEmulatedMedia', { media: 'print' });
      assert.equal(await evaluate('getComputedStyle(document.querySelector("main")).display'), 'none');
      assert.equal(await evaluate('getComputedStyle(document.querySelector("#viewer")).display'), 'none');
      assert.equal(await evaluate('getComputedStyle(document.querySelector("#print-recipe")).display'), 'block');
      assert.equal(await evaluate('getComputedStyle(document.querySelector(".checklist input")).display'), 'none');
      const pdf = await command('Page.printToPDF', { printBackground: true });
      assert.ok(Buffer.from(pdf.data, 'base64').length > 1000);
      if (process.env.BROWSER_ARTIFACT_DIR) await writeFile(join(process.env.BROWSER_ARTIFACT_DIR, 'recept.pdf'), Buffer.from(pdf.data, 'base64'));
      await command('Emulation.setEmulatedMedia', { media: '' });
    });
    await t.test('fout bij laden toont herstelmelding', async () => {
      await command('Network.enable');
      await command('Network.setBlockedURLs', { urls: ['*data/recipes.json*'] });
      await command('Page.navigate', { url: 'http://127.0.0.1:8765/' });
      await wait('document.querySelector("#status")?.textContent.includes("konden niet worden geladen")');
      assert.equal(await evaluate('document.querySelectorAll(".recipe").length'), 0);
    });
  } finally {
    ws?.close();
    chrome.kill();
    server.kill();
    await delay(300);
    await rm(profile, { recursive: true, force: true });
  }
});
