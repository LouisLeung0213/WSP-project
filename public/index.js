let loginSubmit = document.querySelector("#loginSubmit");

let loginForm = document.querySelector("#loginForm");

loginSubmit.addEventListener("click", async (event) => {
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
