// Firestore Referenzen
const todosRef = db.collection("todos");
const shopRef = db.collection("shoplist");

// -----------------------------
// Navigation
// -----------------------------
document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const target = btn.dataset.target;

        document.querySelectorAll(".app").forEach(app => app.classList.add("hidden"));
        document.getElementById(target).classList.remove("hidden");
    });
});

// -----------------------------
// To‑Dos
// -----------------------------
const todoInput = document.getElementById("todoInput");
const todoDate = document.getElementById("todoDate");
const addTodoBtn = document.getElementById("addTodoBtn");
const todoList = document.getElementById("todoList");

addTodoBtn.addEventListener("click", async () => {
    const text = todoInput.value.trim();
    const date = todoDate.value;
    if (!text) return;

    await todosRef.add({
        text,
        date,
        done: false
    });

    todoInput.value = "";
    todoDate.value = "";
});

// Echtzeit‑Sync To‑Dos
todosRef.onSnapshot(snapshot => {
    todoList.innerHTML = "";
    snapshot.forEach(doc => {
        const item = doc.data();
        addTodo(doc.id, item.text, item.date, item.done);
    });
});

function addTodo(id, text, date, done) {
    const li = document.createElement("li");

    li.innerHTML = `
        <input type="checkbox" class="checkbox" ${done ? "checked" : ""}>
        <span class="text">${text}</span>
        <span class="date">${date ? "(" + date + ")" : ""}</span>
        <span class="delete">✖</span>
    `;

    const checkbox = li.querySelector(".checkbox");
    const textSpan = li.querySelector(".text");

    checkbox.addEventListener("change", () => {
        todosRef.doc(id).update({ done: checkbox.checked });
    });

    li.querySelector(".delete").addEventListener("click", () => {
        todosRef.doc(id).delete();
    });

    if (done) textSpan.classList.add("done");

    todoList.appendChild(li);
}

// -----------------------------
// Einkaufsliste
// -----------------------------
const shopInput = document.getElementById("shopInput");
const addShopBtn = document.getElementById("addShopBtn");
const shopList = document.getElementById("shopList");

addShopBtn.addEventListener("click", async () => {
    const text = shopInput.value.trim();
    if (!text) return;

    await shopRef.add({
        text,
        done: false
    });

    shopInput.value = "";
});

// Echtzeit‑Sync Einkaufsliste
shopRef.onSnapshot(snapshot => {
    shopList.innerHTML = "";
    snapshot.forEach(doc => {
        const item = doc.data();
        addShop(doc.id, item.text, item.done);
    });
});

function addShop(id, text, done) {
    const li = document.createElement("li");

    li.innerHTML = `
        <input type="checkbox" class="checkbox" ${done ? "checked" : ""}>
        <span class="text">${text}</span>
        <span class="delete">✖</span>
    `;

    const checkbox = li.querySelector(".checkbox");
    const textSpan = li.querySelector(".text");

    checkbox.addEventListener("change", () => {
        shopRef.doc(id).update({ done: checkbox.checked });
    });

    li.querySelector(".delete").addEventListener("click", () => {
        shopRef.doc(id).delete();
    });

    if (done) textSpan.classList.add("done");

    shopList.appendChild(li);
}
