  // Firebase Authentication
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

provider.addScope(
  "https://www.googleapis.com/auth/calendar.readonly"
);

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");

loginBtn.addEventListener("click", async () => {

    const result = await auth.signInWithPopup(provider);

    console.log("OAuth Credential:");
    console.log(result.credential);

    const token = result.credential.accessToken;

const eventsResponse = await fetch(
  "https://www.googleapis.com/calendar/v3/calendars/family06123350682627900716@group.calendar.google.com/events?maxResults=50&singleEvents=true&orderBy=startTime&timeMin=" + new Date().toISOString(),
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

const events = await eventsResponse.json();

const calendarContent =
    document.getElementById("calendarContent");

calendarContent.innerHTML = "";

events.items.forEach(event => {

    const div = document.createElement("div");

    let datum = "";
    let zeit = "";

    if (event.start.dateTime) {

        const start = new Date(event.start.dateTime);

        datum = start.toLocaleDateString("de-DE", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        zeit = start.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit"
        });

    } else {

        datum = event.start.date;
        zeit = "Ganztägig";

    }

    const ort = event.location
        ? `<div>📍 ${event.location}</div>`
        : "";

    const link = event.htmlLink
        ? `<div><a href="${event.htmlLink}" target="_blank">Im Kalender öffnen</a></div>`
        : "";

    div.innerHTML = `
        <div style="margin-bottom:15px;padding:10px;border:1px solid #ddd;border-radius:8px;">
            <strong>${datum}</strong><br>
            🕒 ${zeit}<br>
            <strong>${event.summary || "(ohne Titel)"}</strong>
            ${ort}
            ${link}
        </div>
    `;

    calendarContent.appendChild(div);

});

  
    console.log("ACCESS TOKEN:");
    console.log(token);

    const response = await fetch(
  "https://www.googleapis.com/calendar/v3/users/me/calendarList",
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

const calendars = await response.json();

console.log("KALENDERLISTE:");
console.log(calendars);

  
});

logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
    location.reload();
});

auth.onAuthStateChanged(async user => {

    if (user) {

        const allowedUsers = [
            "robha88@gmail.com",
            "tanja.reinartz1988@gmail.com"
        ];

        if (!allowedUsers.includes(user.email)) {

            alert("Kein Zugriff erlaubt.");

            await auth.signOut();

            return;
        }

        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        userInfo.textContent = user.email;
    
        console.log("Benutzer angemeldet:", user.email);
    
        todosRef.get().then(() => {
    console.log("Todos geladen");
});

shopRef.get().then(() => {
    console.log("Shop geladen");
});
      
    } else {

        sessionStorage.removeItem("loginRefreshDone");

        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
        userInfo.textContent = "";
    }

});

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

