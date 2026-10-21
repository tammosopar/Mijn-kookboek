'use strict';
const $ = id => document.getElementById(id);
let recipes = [];
const node = (tag, text, className) => {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
};
function openRecipe(recipe) {
  const detail = $('detail');
  detail.replaceChildren();
  const title = node('h2', `${recipe.emoji} ${recipe.name}`);
  title.id = 'recipe-title';
  detail.append(title, node('p', `${recipe.type} · ${recipe.minutes} minuten · ${recipe.portions} personen`, 'muted'));
  for (const [heading, tag, items] of [['Ingrediënten', 'ul', recipe.ingredients], ['Bereiding', 'ol', recipe.instructions]]) {
    const list = node(tag);
    for (const item of items) list.append(node('li', item));
    detail.append(node('h3', heading), list);
  }
  if (recipe.notes) detail.append(node('h3', 'Notities'), node('p', recipe.notes, 'notes'));
  $('viewer').showModal();
}
function render() {
  const query = $('search').value.trim().toLocaleLowerCase('nl');
  const category = $('category').value;
  const shown = recipes.filter(r => `${r.name} ${r.ingredients.join(' ')}`.toLocaleLowerCase('nl').includes(query) && (!category || r.type === category));
  $('count').textContent = `(${recipes.length})`;
  $('grid').replaceChildren();
  $('status').textContent = shown.length ? `${shown.length} recepten` : 'Geen recepten gevonden.';
  for (const recipe of shown) {
    const card = node('button', undefined, 'recipe');
    card.type = 'button';
    card.append(node('span', recipe.emoji, 'visual'), node('strong', recipe.name), node('span', `${recipe.minutes} min · ${recipe.portions} personen`, 'muted'), node('span', recipe.type, 'tag'));
    card.addEventListener('click', () => openRecipe(recipe));
    $('grid').append(card);
  }
}
$('search').addEventListener('input', render);
$('category').addEventListener('change', render);
$('close').addEventListener('click', () => $('viewer').close());
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
  } catch (error) {
    $('status').textContent = 'De recepten konden niet worden geladen. Probeer de pagina opnieuw te openen.';
    console.error(error);
  }
}
load();
