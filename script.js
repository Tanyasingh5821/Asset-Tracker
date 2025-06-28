const signupPage = document.getElementById("signupPage");
const loginPage = document.getElementById("loginPage");
const trackerPage = document.getElementById("trackerPage");
const assetForm = document.getElementById("assetForm");
const assetTable = document.getElementById("assetTable");
const filterSelect = document.getElementById("filter");
const exportBtn = document.getElementById("exportBtn");

let loggedInUser = null;

function showLogin() {
    signupPage.classList.add("hidden");
    loginPage.classList.remove("hidden");
}

function showSignup() {
    loginPage.classList.add("hidden");
    signupPage.classList.remove("hidden");
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === "password" ? "text" : "password";
}

function signup() {
    const username = document.getElementById("newUsername").value;
    const password = document.getElementById("newPassword").value;

    if (!username || !password) return alert("Fill both fields");

    const users = JSON.parse(localStorage.getItem("users")) || {};
    if (users[username]) return alert("Username already exists");

    users[username] = { password, assets: [] };
    localStorage.setItem("users", JSON.stringify(users));
    alert("Account created! Now login.");
    showLogin();
}

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const users = JSON.parse(localStorage.getItem("users")) || {};
    if (!users[username] || users[username].password !== password) {
        return alert("Invalid login");
    }

    loggedInUser = username;
    signupPage.classList.add("hidden");
    loginPage.classList.add("hidden");
    trackerPage.classList.remove("hidden");
    renderAssets();
}

function logout() {
    loggedInUser = null;
    loginPage.classList.remove("hidden");
    trackerPage.classList.add("hidden");
}

function renderAssets() {
    const users = JSON.parse(localStorage.getItem("users"));
    const assets = users[loggedInUser].assets || [];
    const filter = filterSelect.value;

    assetTable.innerHTML = "";

    assets
        .filter(a => filter === "All" || a.type === filter)
        .forEach((asset, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${asset.type}</td>
        <td>${asset.serial}</td>
        <td>${asset.owner}</td>
        <td>${asset.location}</td>
        <td>${asset.warranty}</td>
        <td>${asset.condition}</td>
        <td>
          <button onclick="editAsset(${index})">Edit</button>
          <button onclick="deleteAsset(${index})">Delete</button>
        </td>`;
            assetTable.appendChild(row);
        });
}

let editIndex = null;

assetForm.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(assetForm);
    const newAsset = Object.fromEntries(data.entries());

    const users = JSON.parse(localStorage.getItem("users"));
    const userAssets = users[loggedInUser].assets;

    if (editIndex !== null) {
        userAssets[editIndex] = newAsset;
        editIndex = null;
    } else {
        userAssets.push(newAsset);
    }

    users[loggedInUser].assets = userAssets;
    localStorage.setItem("users", JSON.stringify(users));
    assetForm.reset();
    renderAssets();
});

function editAsset(index) {
    const users = JSON.parse(localStorage.getItem("users"));
    const asset = users[loggedInUser].assets[index];
    const fields = assetForm.elements;
    fields["type"].value = asset.type;
    fields["serial"].value = asset.serial;
    fields["owner"].value = asset.owner;
    fields["location"].value = asset.location;
    fields["warranty"].value = asset.warranty;
    fields["condition"].value = asset.condition;
    editIndex = index;
}

function deleteAsset(index) {
    if (!confirm("Delete this asset?")) return;
    const users = JSON.parse(localStorage.getItem("users"));
    users[loggedInUser].assets.splice(index, 1);
    localStorage.setItem("users", JSON.stringify(users));
    renderAssets();
}

filterSelect.addEventListener("change", renderAssets);

exportBtn.addEventListener("click", () => {
    const users = JSON.parse(localStorage.getItem("users"));
    const assets = users[loggedInUser].assets;

    const csvRows = [
        ["Type", "Serial", "Owner", "Location", "Warranty", "Condition"],
        ...assets.map(a => [a.type, a.serial, a.owner, a.location, a.warranty, a.condition])
    ];
    const csv = csvRows.map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${loggedInUser}-hindalco-assets.csv`;
    a.click();
});
