let image = document.querySelector("[name=mua_portfolio]");
let submitBtn = document.querySelector("#submitBtn");
let portfolioContainer = document.querySelector(".portfolioContainer");
let portfolio = portfolioContainer.querySelector(".portfolio");
let detailContainer = document.querySelector(".detailContainer");
let detail = detailContainer.querySelector(".detail");
// let newDetail = document.querySelectorAll("detail");
let introContainer = document.querySelector(".introContainer");
// let icon = introContainer.querySelector(".icon");
let username = introContainer.querySelector(".username");
// let paragraph = document.querySelecto("edit");
let editBtn = document.getElementById("edit-button");
let endBtn = document.getElementById("end-editing");
let uploadPhoto = document.getElementById("choosePhoto");
let profileTemplate = document.querySelector(".profileTemplate");

let profileIcon = document.querySelector("#profileIcon");

let params = new URL(document.location).searchParams;
let paramsName = params.get("id");
console.log("Current params: ", paramsName);

submitBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  console.log(event.target);

  let formData = new FormData();

  formData.append("mua_portfolio", image.files[0]);
  const res = await fetch("/addWork", {
    method: "POST",
    body: formData,
  });
  let json = await res.json();
  console.log(json);
  alert("Success!");
  location.reload();
});

fetch(`/profile?id=${paramsName}`)
  .then((res) => res.json())
  .then((json) => {
    console.log(json);
    // console.log("other:" + paramsName);
    if (json.currentUser != paramsName) {
      submitBtn.hidden = true;
      endBtn.hidden = true;
      editBtn.hidden = true;
      uploadPhoto.hidden = true;
    }
    for (let work of json.works) {
      let node = portfolio.cloneNode(true);
      portfolio.hidden = true;
      let photo = `/uploads/${work.mua_portfolio}`;
      node.src = photo;
      portfolioContainer.appendChild(node);
    }
    let intro = json.user.introduction;
    let introNode = detail.cloneNode(true);
    introNode.textContent = intro;
    detailContainer.appendChild(introNode);
    detail.remove();
    detail = detailContainer.querySelector(".detail");

    let nickname = json.user.nickname;
    let nickNameNode = username.cloneNode(true);
    nickNameNode.textContent = nickname;
    username.hidden = true;
    introContainer.appendChild(nickNameNode);

    let icon = json.user.icon;
    let iconNode = profileIcon.cloneNode(true);
    profileIcon.hidden = true;
    let myIcon;
    if (json.user.icon) {
      myIcon = `/uploads/${icon}`;
    } else {
      myIcon = `/uploads/default_profile_pic.jpg`;
    }

    iconNode.src = myIcon;
    introContainer.appendChild(iconNode);
  });

// let profileShowDiv = document.querySelector(".profileShowDiv");
// window.onload = async () => {
//   let defaultPic = document.createElement("img");
//   defaultPic.src = "/image/default_profile_pic.jpg";
//   defaultPic.alt = "profilePic";
//   profileTemplate.appendChild(defaultPic);
//   const res = await fetch("/isMua");
//   if (res.status == 200) {
//     let json = await res.json();
//     console.log(json);
//     //show profile node
//     // let node = profileTemplate.cloneNode(true);
//     profileTemplate.hidden = true;

//     let image = document.createElement("img");
//     image.src = `/uploads/${json.pic}`;
//     image.alt = "icon";
//     image.id = "profileIcon";
//     profileShowDiv.appendChild(image);
//   }
// };

// fetch(`/showNickname?id=${paramsName}`)
//   .then((res) => {
//     return res.json();
//   })
//   .then((nicknames) => {
//     for (let nickname of nicknames) {
//       let node = username.cloneNode(true);
//       node.textContent = nickname.nickname;
//       username.hidden = true;
//       // node.className = "detail";
//       introContainer.appendChild(node);
//     }
//   });
// fetch(`/showWork?id=${paramsName}`)
//   .then((res) => {
//     return res.json();
//     // console.log(res.json());
//   })
//   .then((works) => {
//     console.log(works);
//     for (let work of works) {
//       //   console.log(work);
//       let node = portfolio.cloneNode(true);
//       //   portfolio.hidden = true;
//       //   node.textContent = "haha";
//       let test = `../uploads/${work.mua_portfolio}`;
//       console.log("test: ", test);
//       node.src = test;
//       portfolioContainer.appendChild(node);
//       console.log(node.src);
//       //   console.log(node);
//     }
//   });

// fetch(`/showDetails?id=${paramsName}`)
//   .then((res) => {
//     return res.json();
//   })
//   .then((intros) => {
//     console.log(intros);
//     for (let intro of intros) {
//       let node = detail.cloneNode(true);
//       node.textContent = intro.introduction;
//       // detail.hidden = true;
//       console.log(node.textContent);
//       detailContainer.appendChild(node);
//       detail.remove();
//       detail = detailContainer.querySelector(".detail");
//     }
//   });

editBtn.addEventListener("click", function () {
  detail.contentEditable = true;
});

endBtn.addEventListener("click", async function () {
  detail.contentEditable = false;
  console.log(detail.textContent);
  const res = await fetch(`/editIntro?id=${paramsName}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ content: detail.textContent }),
  });
  let json = await res.json();
  console.log(json);
});
