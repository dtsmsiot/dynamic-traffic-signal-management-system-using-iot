const list = document.getElementById("list");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "admin") {
  alert("Access Denied! Admin Only.");
  window.location.href = "login.html";
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function displayRequests() {
  const users = getUsers();
  list.innerHTML = "";

  const pendingUsers = users.filter(
    u => (u.role === "police" || u.role === "emergency") 
         && u.status === "pending"
  );

  if (pendingUsers.length === 0) {
    list.innerHTML = "<p>No pending requests.</p>";
    return;
  }

  pendingUsers.forEach(user => {
    const card = document.createElement("div");
    card.className = "request-card";

    const info = document.createElement("div");
    info.innerHTML = `
      <strong>Name:</strong> ${user.name}<br>
      <strong>Username:</strong> ${user.username}<br>
      <strong>Role:</strong> ${user.role.toUpperCase()}
    `;

    const approveBtn = document.createElement("button");
    approveBtn.innerText = "Approve";
    approveBtn.className = "approve";
    approveBtn.onclick = () => updateStatus(user.username, "approved");

    const rejectBtn = document.createElement("button");
    rejectBtn.innerText = "Reject";
    rejectBtn.className = "reject";
    rejectBtn.onclick = () => updateStatus(user.username, "rejected");

    card.appendChild(info);
    card.appendChild(approveBtn);
    card.appendChild(rejectBtn);

    list.appendChild(card);
  });
}

function updateStatus(username, status) {
  const users = getUsers();
  const index = users.findIndex(u => u.username === username);

  if (index !== -1) {
    users[index].status = status;
    saveUsers(users);
    alert(`User ${status}`);
    displayRequests();
  }
}

displayRequests();