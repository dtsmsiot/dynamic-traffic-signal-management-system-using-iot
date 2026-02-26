function validateLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const error = document.getElementById("error");

  let users = JSON.parse(localStorage.getItem("users")) || [];

 
  if (!users.some(u => u.role === "admin")) {
    users.push({
      name: "Admin",
      username: "admin",
      password: "admin123",
      role: "admin",
      status: "approved"
    });
    localStorage.setItem("users", JSON.stringify(users));
  }

  const user = users.find(
    u => u.username === username &&
         u.password === password &&
         u.role === role
  );

  if (!user) {
    error.innerText = "Invalid credentials";
    return false;
  }

  if (user.status !== "approved") {
    error.innerText = "Waiting for admin approval";
    return false;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));

  if (role === "admin") {
    window.location.href = "index.html";
  } else if (role === "police") {
    window.location.href = "indexpolice.html";
  } else if (role === "emergency") {
    window.location.href = "indexemergency.html";
  }

  return false;
}