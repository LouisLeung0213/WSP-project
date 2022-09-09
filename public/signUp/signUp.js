let signUp = document.querySelector(".signUpSubmit");
let lastName = document.querySelector("[name=lastName]");
let firstName = document.querySelector("[name=firstName]");
let password = document.querySelector("[name=password]");
let birthday = document.querySelector("[name=birthday]");
let email = document.querySelector("[name=email]");
let image = document.querySelector("[name=image]");

let fullname = `${lastName.value} ${firstName.value}`;

signUp.addEventListener("click", async (event) => {
  event.preventDefault();
  console.log(event.target);
  let res = await fetch("./signUp");
  let json = res.json();
  console.log(json);
  let formData = new FormData();

  formData.append("name", fullname);
  formData.append("password", password.value); //not hash yet
  formData.append("birthday", birthday.value);
  formData.append("email", email.value);
  formData.append("image", image.files[0]);

  console.log(image.files);

  fetch("/signUp", {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
    });
});
