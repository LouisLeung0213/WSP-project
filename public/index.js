let loginForm = document.querySelector("#loginForm");
let googleLogin = document.querySelector(".google");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  let name = loginForm.username.value;
  const res = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      username: loginForm.username.value,
      password: loginForm.password.value,
    }),
  });
  let json = await res.json();
  console.log(res);
  console.log(json);
  if (!res.ok) {
    if (res.status == 404) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "User does not exist!",
      });
    } else if (res.status == 402) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Wrong username or password",
      });
    }
  } else {
    Swal.fire({
      icon: "success",
      title: `Welcome back, ${name}`,
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) window.location = "/lobby/lobby.html";
    });
  }
});

//redirect to lobby if user already login
window.onload = async () => {
  const res = await fetch("/currentUser");
  const user = await res.json();
  console.log(user);
  if (user) {
    window.location.href = "/lobby/lobby.html";
  }
};
