function showLogin() {
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}
function showRegister() {
    document.getElementById("registerForm").style.display = "block";
    document.getElementById("loginForm").style.display = "none";
}

function register() {
    const name = document.getElementById("username").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (!email.includes("@")) {
        alert("Please enter a valid email");
        return;
    }
    if (!name || !email || !password) {
        alert("Fill all fields!");
        return;
    }

    const user = { name, email, password };
    localStorage.setItem("user", JSON.stringify(user));
    alert("Registered successfully");
    showLogin();
}
function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("No user found! Please register first");
        return;
    }

    if (email === user.email && password === user.password) {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("registerForm").style.display = "none";
        document.getElementById("profileSection").style.display = "block";
        document.getElementById("profileName").innerText = user.name;
        document.getElementById("profileEmail").innerText = user.email;

    } else {
        alert("Wrong email or password");
    }
}
function logout() {
    document.getElementById("profileSection").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}
