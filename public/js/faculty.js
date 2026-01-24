let facultyData = [];

const searchInput = document.getElementById("facultySearch");
const resultsContainer = document.getElementById("facultyResults");

fetch("data/faculty_clean.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("Failed to load faculty data");
    }
    return response.json();
  })
  .then(data => {
    facultyData = data;
    // ❌ DO NOT render anything here
  })
  .catch(error => {
    console.error("Faculty fetch error:", error);
  });


searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  // If the query is empty, clear the results and exit
  if (!query) {
    resultsContainer.innerHTML = ""; 
    return;
  }

  // Otherwise, filter and render
  renderFaculty(filterFaculty(query));
});

function filterFaculty(query) {
  return facultyData.filter(f => {
    const name = (f.name || "").toLowerCase();
    const designation = (f.designation || "").toLowerCase();
    const office = (f.office_address || "").toLowerCase();

    return (
      name.includes(query) ||
      designation.includes(query) ||
      office.includes(query)
    );
  })
   .slice(0, 15);
}

function renderFaculty(list) {
  resultsContainer.innerHTML = "";

  if (list.length === 0) {
    resultsContainer.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center; color:#6b7280">
        No matching faculty found
      </p>
    `;
    return;
  }

  list.forEach(f => {
    const card = document.createElement("div");
    card.className = "card faculty-card";

    card.innerHTML = `
      <img src="${f.image || ""}" alt="${f.name}">
      <h3>${f.name}</h3>
      <p>${f.designation || ""}</p>
      <p>${f.office_address || ""}</p>
    `;

    resultsContainer.appendChild(card);
  });
}
