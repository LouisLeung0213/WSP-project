import "./session";

let image = document.querySelector("[name=profile]");

let submitBtn = document.querySelector("submitBtn");

submitBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  console.log(event.target);

  let formData = new FormData();

  formData.append("mua_profilo", image.files[0]);
  const res = await fetch("addWork", {
    method: "POST",
    body: formData,
  });
  let json = await res.json();
  console.log(json);
});
