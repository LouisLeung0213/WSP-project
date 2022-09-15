let image = document.querySelector("[name=mua_portfolio]");
let submitBtn = document.querySelector("#submitBtn");
let portfolioContainer = document.querySelector(".portfolioContainer");
let portfolio = portfolioContainer.querySelector(".portfolio");
let detailContainer = document.querySelector(".detailContainer");
let detail = detailContainer.querySelector(".detail");
let introContainer = document.querySelector(".introContainer");
// let icon = introContainer.querySelector(".icon");
let username = introContainer.querySelector(".username");

let params = (new URL(document.location)).searchParams
let paramsName = params.get('id');
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

fetch(`/showWork?id=${paramsName}`)
  .then((res) => {
    return res.json();
    // console.log(res.json());
  })
  .then((works) => {
    console.log(works);
    for (let work of works) {
      //   console.log(work);
      let node = portfolio.cloneNode(true);
      //   portfolio.hidden = true;
      //   node.textContent = "haha";
      let test = `../uploads/${work.mua_portfolio}`;
      console.log("test: ", test);
      node.src = test;
      portfolioContainer.appendChild(node);
      console.log(node.src);
      //   console.log(node);
    }
  });

fetch(`/showDetails?id=${paramsName}`)
  .then((res) => {
    return res.json();
  })
  .then((intros) => {
    console.log(intros);
    for (let intro of intros) {
      let node = detail.cloneNode(true);
      node.textContent = intro.introduction;
      detail.hidden = true;
      console.log(node.textContent);
      detailContainer.appendChild(node);
    }
  });

fetch(`/showNickname?id=${paramsName}`)
  .then((res) => {
    return res.json();
  })
  .then((nicknames) => {
    for (let nickname of nicknames) {
      let node = username.cloneNode(true);
      node.textContent = nickname.nickname;
      username.hidden = true;
      introContainer.appendChild(node);
    }
  });

