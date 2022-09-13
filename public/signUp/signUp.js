let signUpForm = document.querySelector(".signUpSubmit");
let fullName = document.querySelector("[name=fullName]");
let nickName = document.querySelector("[name=nickName]");
let password = document.querySelector("[name=password]");
let birthday = document.querySelector("[name=birthday]");
let email = document.querySelector("[name=email]");
let image = document.querySelector("[name=image]");

signUpForm.addEventListener("click", async (event) => {
  event.preventDefault();

  console.log(event.target);

  let formData = new FormData();

  formData.append("name", fullName.value);
  formData.append("nickName", nickName.value);
  formData.append("password", password.value); //not hash yet
  formData.append("birthday", birthday.value);
  formData.append("email", email.value);
  formData.append("image", image.files[0]);

  console.log(birthday.value);
  console.log(formData);
  console.log(image.files);
  await fetch("/signUp", {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
});
