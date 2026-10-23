'use strict';
const $ = id => document.getElementById(id);
let recipes = [];
let currentRecipe = null;
let selectedPortions = 1;
let progress = {};
const node = (tag, text, className) => {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
};
const ingredientName = item => typeof item === 'string' ? item : item.name;
function ingredientText(item) {
  if (typeof item === 'string') return item;
  const quantity = item.quantity === null ? '' : new Intl.NumberFormat('nl', { maximumFractionDigits: 2 }).format(item.quantity * selectedPortions / currentRecipe.portions);
  return [quantity, item.unit, item.name].filter(Boolean).join(' ');
}
function readProgress(id) {
  try {
    const saved = JSON.parse(localStorage.getItem(`cookbook:${id}`));
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  }
  catch { return {}; }
}
function checklist(tag, items, kind) {
  const list = node(tag, undefined, 'checklist');
  items.forEach((text, index) => {
    const li = node('li');
    const label = node('label');
    const checkbox = node('input');
    checkbox.type = 'checkbox';
    const key = `${kind}:${index}:${kind === 'ingredient' ? JSON.stringify(currentRecipe.ingredients[index]) : text}`;
    checkbox.checked = progress[key] === true;
    checkbox.addEventListener('change', () => {
      progress[key] = checkbox.checked;
      try { localStorage.setItem(`cookbook:${currentRecipe.id}`, JSON.stringify(progress)); }
      catch { /* Koken blijft mogelijk als browseropslag niet beschikbaar is. */ }
    });
    label.append(checkbox, node('span', text));
    li.append(label);
    list.append(li);
  });
  return list;
}
function coverPhoto(recipe, detail = false) {
  if (!recipe.cover) return node('span', recipe.emoji, 'visual');
  const image = node('img', undefined, detail ? 'detail-cover' : 'recipe-cover');
  image.src = `./${recipe.cover.src}`;
  image.alt = recipe.cover.alt;
  image.width = 1200;
  image.height = 800;
  image.loading = detail ? 'eager' : 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => image.replaceWith(node('span', recipe.emoji, 'visual')), { once: true });
  return image;
}
function renderRecipe() {
  const recipe = currentRecipe;
  const detail = $('detail');
  detail.replaceChildren();
  if (recipe.cover) detail.append(coverPhoto(recipe, true));
  const title = node('h2', `${recipe.emoji} ${recipe.name}`);
  title.id = 'recipe-title';
  detail.append(title, node('p', `${recipe.type} · ${recipe.minutes} minuten · ${selectedPortions} porties`, 'muted'));
  const controls = node('div', undefined, 'recipe-controls');
  const portionLabel = node('label', 'Porties');
  const portions = node('input');
  portions.id = 'portions';
  portions.type = 'number';
  portions.min = '1';
  portions.max = '100';
  portions.step = '1';
  portions.value = selectedPortions;
  portions.addEventListener('change', () => {
    const value = Number(portions.value);
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      portions.value = selectedPortions;
      return;
    }
    selectedPortions = value;
    renderRecipe();
    $('portions').focus();
  });
  portionLabel.append(portions);
  const permalink = node('a', 'Link naar dit recept');
  permalink.href = `#${recipe.id}`;
  const print = node('button', 'Print recept');
  print.type = 'button';
  print.addEventListener('click', () => window.print());
  const reset = node('button', 'Vinkjes wissen');
  reset.type = 'button';
  reset.addEventListener('click', () => {
    progress = {};
    try { localStorage.removeItem(`cookbook:${recipe.id}`); } catch { /* Optionele opslag. */ }
    renderRecipe();
  });
  controls.append(portionLabel, permalink, print, reset);
  detail.append(controls, node('p', `${selectedPortions} porties · Hoeveelheden zonder getal blijven gelijk. Bereidingstijden worden niet omgerekend.`, 'portion-note'));
  detail.append(node('h3', 'Ingrediënten'), checklist('ul', recipe.ingredients.map(ingredientText), 'ingredient'));
  detail.append(node('h3', 'Bereiding'), checklist('ol', recipe.instructions, 'step'));
  if (recipe.notes) detail.append(node('h3', 'Notities'), node('p', recipe.notes, 'notes'));
}
function openRecipe(recipe) {
  const changed = currentRecipe?.id !== recipe.id;
  currentRecipe = recipe;
  if (changed) {
    selectedPortions = recipe.portions;
    progress = readProgress(recipe.id);
  }
  renderRecipe();
  $('link-status').textContent = '';
  if (!$('viewer').open) $('viewer').showModal();
}
function followHash() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = ''; }
  const recipe = recipes.find(r => r.id === id);
  if (recipe) openRecipe(recipe);
  else {
    if ($('viewer').open) $('viewer').close();
    currentRecipe = null;
    $('link-status').textContent = location.hash ? 'Dit recept bestaat niet. Kies een recept uit het overzicht.' : '';
  }
}
function closeRecipe() {
  if (location.hash) {
    history.pushState(null, '', location.pathname + location.search);
  }
  if ($('viewer').open) $('viewer').close();
  currentRecipe = null;
}
function render() {
  const query = $('search').value.trim().toLocaleLowerCase('nl');
  const category = $('category').value;
  const shown = recipes.filter(r => `${r.name} ${r.ingredients.map(ingredientName).join(' ')}`.toLocaleLowerCase('nl').includes(query) && (!category || r.type === category));
  $('count').textContent = `(${recipes.length})`;
  $('grid').replaceChildren();
  $('status').textContent = shown.length ? `${shown.length} recepten` : 'Geen recepten gevonden.';
  for (const recipe of shown) {
    const card = node('button', undefined, 'recipe');
    card.type = 'button';
    card.append(coverPhoto(recipe), node('strong', recipe.name), node('span', `${recipe.minutes} min · ${recipe.portions} personen`, 'muted'), node('span', recipe.type, 'tag'));
    card.addEventListener('click', () => {
      if (location.hash === `#${recipe.id}`) openRecipe(recipe);
      else location.hash = recipe.id;
    });
    $('grid').append(card);
  }
}
$('search').addEventListener('input', render);
$('category').addEventListener('change', render);
$('close').addEventListener('click', closeRecipe);
$('viewer').addEventListener('cancel', event => { event.preventDefault(); closeRecipe(); });
window.addEventListener('hashchange', followHash);
async function load() {
  try {
    const response = await fetch('./data/recipes.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    recipes = await response.json();
    for (const category of [...new Set(recipes.map(r => r.type))].sort()) {
      const option = node('option', category);
      option.value = category;
      $('category').append(option);
    }
    render();
    followHash();
  } catch (error) {
    $('status').textContent = 'De recepten konden niet worden geladen. Probeer de pagina opnieuw te openen.';
    console.error(error);
  }
}
load();

window.addEventListener('beforeprint', () => {
  if (!currentRecipe || !$('viewer').open) return;
  $('print-recipe')?.remove();
  const printRecipe = node('article', undefined, 'print-recipe');
  printRecipe.id = 'print-recipe';
  const copy = $('detail').cloneNode(true);
  copy.removeAttribute('id');
  copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  printRecipe.append(copy);
  document.body.append(printRecipe);
});
window.addEventListener('afterprint', () => $('print-recipe')?.remove());
