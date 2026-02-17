// ================================
// MESS MENU LOGIC (FINAL UI VERSION)
// ================================

const messMetaEl = document.getElementById("messMeta");
const messCardsEl = document.getElementById("messCards");
const today = new Date();
const now = new Date();


const todayDate = today.getDate(); // 1–31 (this is what your JSON uses)


const hostelSelect = document.getElementById("hostelSelect");

loadMenu("mh"); // default

hostelSelect.addEventListener("change", e => {
  loadMenu(e.target.value);
});

function loadMenu(hostel) {
  const file =
    hostel === "lh"
      ? "./data/lh_mess.json"
      : "./data/mess_menue.json";

  fetch(file)
    .then(res => {
      if (!res.ok) throw new Error("Failed to load mess menu");
      return res.json();
    })
    .then(data => {
      renderTodayMenu(data, hostel);
    })
    .catch(err => {
      console.error(err);
      messCardsEl.innerHTML = "<p>Failed to load menu</p>";
    });
}



function renderTodayMenu(data,hostel) {
  messMetaEl.textContent = "VIT-AP Hostels · January 2026";

  let todayEntry = data[String(todayDate)];

  // Handle "Repeat Day X"
  if (typeof todayEntry === "string") {
    const match = todayEntry.match(/\d+/);
    if (match) {
      todayEntry = data[match[0]];
    }
  }

  if (!todayEntry) {
    messCardsEl.innerHTML = "<p>Menu not available</p>";
    return;
  }

  messCardsEl.innerHTML = "";

  const meals = [
    { key: "breakfast", label: "Breakfast" },
    { key: "lunch", label: "Lunch" },
    { key: "snacks", label: "Snacks" },
    { key: "dinner", label: "Dinner" }
  ];

  meals.forEach(meal => {
    const items = todayEntry[meal.key];
    if (!items || items.length === 0) return;

    const card = document.createElement("div");
    card.className = "card mess-card";

    card.innerHTML = `
      <h3>${meal.label}</h3>
      <ul>
        ${items.map(item => `<li>${item}</li>`).join("")}
      </ul>
    `;

    messCardsEl.appendChild(card);
  });
}
