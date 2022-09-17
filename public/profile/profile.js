let image = document.querySelector("[name=mua_portfolio]");
let submitBtn = document.querySelector("#submitBtn");
let portfolioContainer = document.querySelector(".btnContainer");
let portfolioBtn = portfolioContainer.querySelector(".imageBtn");
let detailContainer = document.querySelector(".detailContainer");
let detail = detailContainer.querySelector(".detail");
let submitContainer = document.querySelector(".submitContainer");
let workDescription = document.querySelector("[name=description]");
let introContainer = document.querySelector(".introContainer");

let username = introContainer.querySelector(".username");

let editBtn = document.getElementById("edit-button");
let endBtn = document.getElementById("end-editing");
let uploadPhoto = document.getElementById("choosePhoto");
let profileTemplate = document.querySelector(".profileTemplate");
let profileIcon = document.querySelector("#profileIcon");
let deleteBtn = document.querySelector(".deleteBtn");
let insideDescription = document.querySelector(".insideDescription");
let descriptionBtn = document.querySelector(".descriptionBtn");
let doneBtn = document.querySelector(".doneBtn");
let saveCat = document.querySelector("#saveCat");

let params = new URL(document.location).searchParams;
let paramsName = params.get("id");
let change = true;

console.log("Current params: ", paramsName);

submitBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  console.log(event.target);
  try {
    let formData = new FormData();

    formData.append("mua_portfolio", image.files[0]);
    formData.append("mua_description", workDescription.value);
    // console.log(workDescription);
    const res = await fetch("/addWork", {
      method: "POST",
      body: formData,
    });
    let json = await res.json();
    console.log(json);

    alert(`${json.message}`);

    window.location.reload();
  } catch (error) {
    alert("file cannot be empty");
  }
});

deleteBtn.addEventListener("click", async (event) => {
  let insideImage = event.path[2]
    .querySelector(".portfolio1")
    .src.split("/")
    .slice(4);

  event.preventDefault();

  let res = await fetch("/deletePortfolio", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ insideImage }),
  });
  let json = await res.json();
  console.log(json);
  window.location.reload();
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
      deleteBtn.hidden = true;
      submitContainer.hidden = true;
      descriptionBtn.hidden = true;
      doneBtn.hidden = true;
    }
    for (let work of json.works) {
      let node = portfolioBtn.cloneNode(true);
      let nodeContent = node.querySelector(".portfolio");
      let nodeDescription = node.querySelector(".outsideDescription");
      let photo = `/uploads/${work.mua_portfolio}`;
      nodeDescription.innerHTML = `${work.mua_description}`;
      nodeContent.src = photo;
      nodeDescription.hidden = true;
      portfolioContainer.appendChild(node);
      portfolioBtn.remove();
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

descriptionBtn.addEventListener("click", async (event) => {
  // console.log(event);
  let insideEdit = document.querySelector(".insideDescription");
  console.log(insideEdit);
  insideEdit.contentEditable = true;
});

doneBtn.addEventListener("click", async (event) => {
  let insideEdit = document.querySelector(".insideDescription");
  // console.log(insideEdit);
  console.log(insideEdit.textContent);
  insideEdit.contentEditable = false;
  const res = await fetch(`/editDescription?id=${paramsName}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ content: insideEdit.textContent }),
  });
  let json = await res.json();
  console.log(json);
});

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

fetch(`/filter?id=${paramsName}`)
  .then((res) => res.json())
  .then((categories) => {
    console.log("categories.allCats: ", categories.allCats);
    console.log("categories.muaCats: ", categories.muaCats);
    let catMap = new Map();
    let catsTree = [];

    for (const catRow of categories.allCats) {
      let catNode = {
        id: catRow.id,
        name: catRow.categories_name,
        children: [],
      };
      catMap.set(catRow.id, catNode);
      if (catRow.parent_id == null) {
        catsTree.push(catNode);
      } else {
        let parent = catMap.get(catRow.parent_id);
        parent.children.push(catNode);
      }
    }
    // console.dir(catsTree, { depth: 20 });

    let catList = document.querySelector(".cat-list");
    let catTemplate = catList.querySelector(".cat");

    function showCats(catsTree, catList) {
      catList.textContent = "";
      for (const cat of catsTree) {
        // console.log(cat.name);
        let node = catTemplate.cloneNode(true);
        let checkbox = node.querySelector("input");
        if (cat.children.length > 0) {
          checkbox.hidden = true;
        }
        checkbox.value = cat.id;
        if (categories.muaCats.filter(word => word == cat.id).length > 0){
          checkbox.checked = true
        }
        catList.appendChild(node);
        node.querySelector(".cat-name").textContent = cat.name;
        let subCatList = node.querySelector(".cat-list");
        // console.log(subCatList);

        showCats(cat.children, subCatList);
      }
    }

    showCats(catsTree, catList);
  });

saveCat.addEventListener("submit", (event) => {
  event.preventDefault();
  let form = event.target;
  let tags = { cats: [], dates: [] };
  for (let cat of form) {
    // console.log(cat);
    if (cat.checked) {
      tags.cats.push(+cat.value);
    }
  }
  // console.log(selectedDatesMua);
  // console.log(selectedDatesStr);
  tags.dates = selectedDatesMua;
  fetch(`/saveCat`, {
    method: "post",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(tags),
  })
    .then((res) => {
      return res.json();
    })
    .then((message) => {
      alert(message)
      console.log(message);
    });
});

function showAvailableDate() {
  fetch(`/showAvailableDate?id=${paramsName}`)
    .then((res) => res.json())
    .then((unavailable_dates) => {
      let dates = document.querySelectorAll(".selectable");
      for (let date of dates) {
        for (let unavailable_date of unavailable_dates) {
          if (date.id == unavailable_date.date) {
            if (date.classList.contains("selected")) {
              date.classList.remove("selected");
            }
            break;
          }
          date.classList.add("selected");
        }
      }
    });
}
showAvailableDate();

fetch(`/selectedDatesMua?id=${paramsName}`)
  .then((res) => res.json())
  .then((unavailable_dates) => {
    for (let unavailable_date of unavailable_dates) {
      selectedDatesMua.push(unavailable_date.date)
    }
    // console.log(selectedDatesMua);
  });

document
  .getElementById("exampleModal")
  .addEventListener("show.bs.modal", async (event) => {
    console.log(event);
    outsideText = event.relatedTarget.querySelector(
      ".outsideDescription"
    ).innerHTML;
    insideText =
      event.currentTarget.querySelector(".insideDescription").innerHTML;
    outsideImage = event.relatedTarget.querySelector(".portfolio").src;
    insideImage = event.currentTarget.querySelector(".portfolio1").src;
    insideImage = outsideImage;
    insideText = outsideText;
    console.log(insideText);
    // console.log(event.currentTarget);
    event.currentTarget.querySelector(".portfolio1").src = insideImage;
    event.currentTarget.querySelector(".insideDescription").innerHTML =
      insideText;
  });
