function registerUser(roleType) {
  const name = document.getElementById("police_name").value;
  const username = document.getElementById("su_username").value;
  const password = document.getElementById("su_password").value;
  const msg = document.getElementById("msg");

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const exists = users.some(u => u.username === username);
  if (exists) {
    msg.style.color = "red";
    msg.innerText = "Username already exists";
    return false;
  }

  const newUser = {
    name: name,
    username: username,
    password: password,
    role: roleType,        
    status: "pending"      
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  msg.style.color = "green";
  msg.innerText = "Registered successfully. Wait for admin approval.";

  document.getElementById("police_name").value = "";
  document.getElementById("su_username").value = "";
  document.getElementById("su_password").value = "";

  return false;
}