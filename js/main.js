const grid = document.getElementById("card-grid");
const searchInput = document.getElementById("search-input");
const packFilter = document.getElementById("pack-filter");
const illustratorFilter = document.getElementById("illustrator-filter");

const modalBackdrop = document.getElementById("modal-backdrop");
const modalClose = document.getElementById("modal-close");
const modalArt = document.getElementById("modal-art");
const modalName = document.getElementById("modal-name");
const modalSub = document.getElementById("modal-sub");
const modalDetails = document.getElementById("modal-details");
const modalFlavor = document.getElementById("modal-flavor");

let allCards = [];

function cardTileHTML(card) {
  return `
    <article class="card-tile" data-id="${card.id}" style="--hue: ${card.hue}">
      <div class="card-art">${card.name}</div>
      <div class="card-info">
        <h3 class="card-name">${card.name}</h3>
        <p class="card-meta">収録パック: ${card.pack}</p>
        <p class="card-meta">イラスト: ${card.illustrator}</p>
      </div>
    </article>
  `;
}

function renderCards(cards) {
  if (cards.length === 0) {
    grid.innerHTML = `<p class="loading-text">条件に一致するカードが見つかりませんでした。</p>`;
    return;
  }
  grid.innerHTML = cards.map(cardTileHTML).join("");
}

function uniqueValues(cards, key) {
  return [...new Set(cards.map((c) => c[key]))].sort((a, b) => a.localeCompare(b, "ja"));
}

function populateFilterOptions() {
  for (const pack of uniqueValues(allCards, "pack")) {
    const opt = document.createElement("option");
    opt.value = pack;
    opt.textContent = pack;
    packFilter.appendChild(opt);
  }
  for (const illustrator of uniqueValues(allCards, "illustrator")) {
    const opt = document.createElement("option");
    opt.value = illustrator;
    opt.textContent = illustrator;
    illustratorFilter.appendChild(opt);
  }
}

function applyFilters() {
  const keyword = searchInput.value.trim().toLowerCase();
  const pack = packFilter.value;
  const illustrator = illustratorFilter.value;

  const filtered = allCards.filter((card) => {
    const matchesKeyword =
      !keyword ||
      card.name.toLowerCase().includes(keyword) ||
      card.nameEn.toLowerCase().includes(keyword);
    const matchesPack = !pack || card.pack === pack;
    const matchesIllustrator = !illustrator || card.illustrator === illustrator;
    return matchesKeyword && matchesPack && matchesIllustrator;
  });

  renderCards(filtered);
}

function openModal(card) {
  modalArt.textContent = card.name;
  modalArt.style.setProperty("--hue", card.hue);
  modalName.textContent = `${card.name}(${card.nameEn})`;
  modalSub.textContent = `${card.cardNumber} ・ ${card.rarity} ・ ${card.types.join("/")}`;

  modalDetails.innerHTML = `
    <dt>HP</dt><dd>${card.hp}</dd>
    <dt>収録パック</dt><dd>${card.pack}</dd>
    <dt>イラストレーター</dt><dd>${card.illustrator}</dd>
    <dt>発売日</dt><dd>${card.releaseDate}</dd>
  `;
  modalFlavor.textContent = card.flavorText;

  modalBackdrop.hidden = false;
}

function closeModal() {
  modalBackdrop.hidden = true;
}

grid.addEventListener("click", (event) => {
  const tile = event.target.closest(".card-tile");
  if (!tile) return;
  const card = allCards.find((c) => c.id === tile.dataset.id);
  if (card) openModal(card);
});

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalBackdrop.hidden) closeModal();
});

searchInput.addEventListener("input", applyFilters);
packFilter.addEventListener("change", applyFilters);
illustratorFilter.addEventListener("change", applyFilters);

async function loadCards() {
  const res = await fetch("data/cards.json");
  allCards = await res.json();
  populateFilterOptions();
  renderCards(allCards);
}

loadCards();
