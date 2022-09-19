let image = document.querySelector("[name=mua_portfolio]");
let submitBtn = document.querySelector("#submitBtn");
let portfolioContainer = document.querySelector(".btnContainer");
let portfolioBtn = portfolioContainer.querySelector(".imageBtn");
let detailContainer = document.querySelector(".detailContainer");
let detail = detailContainer.querySelector(".detail");
let submitContainer = document.querySelector(".submitContainer");
let workDescription = document.querySelector("[name=description]");
let introContainer = document.querySelector(".introContainer");
let ratingContainer = document.querySelector(".ratingContainer");
let username = introContainer.querySelector(".username");
//for edit profile
let saveCatSubmit = document.querySelector("#saveCatSubmit");
let editBtn = document.getElementById("edit-button");
let editDialog = document.querySelector("#editDialog");
let diaDiv = document.querySelector(".diaDiv");
let updateProfileForm = diaDiv.querySelector("#updateProfile");
let diaSubmitBtn = diaDiv.querySelector("#diaSubmitBtn");
let diaCancelBtn = diaDiv.querySelector("#diaCancelBtn");
let updateNickname = diaDiv.querySelector("[name=updateNickname]");
let updatePassword = diaDiv.querySelector("[name=updatePassword]");
let updateIcon = diaDiv.querySelector("[name=updateIcon]");
let dialogDetail = diaDiv.querySelector("[name=dialogDetail]");

//for upload
let uploadPhoto = document.getElementById("choosePhoto");
let profileTemplate = document.querySelector(".profileTemplate");
let profileIcon = document.querySelector("#profileIcon");
let deleteBtn = document.querySelector(".deleteBtn");
let insideDescription = document.querySelector(".insideDescription");
let descriptionBtn = document.querySelector(".descriptionBtn");
let doneBtn = document.querySelector(".doneBtn");
let saveCat = document.querySelector("#saveCat");

editDialog.hidden = true;

editBtn.addEventListener("click", () => {
  editDialog.hidden = false;
});

diaCancelBtn.addEventListener("click", () => {
  editDialog.hidden = true;
});

let change = true;

// console.log("Current params: ", paramsName);

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

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: `upload success`,
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) window.location.reload();
      });
    }
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

//for load profile page
fetch(`/profile?id=${paramsName}`)
  .then((res) => res.json())
  .then((json) => {
    // console.log(json);
    // console.log("other:" + paramsName);
    if (json.currentUser != paramsName) {
      submitBtn.hidden = true;
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
    //console.log(json);
    let introNode = detail.cloneNode(true);
    introNode.textContent = intro;
    detailContainer.appendChild(introNode);
    detail.remove();
    detail = detailContainer.querySelector(".detail");
    dialogDetail.textContent = intro;

    let nickname = json.user.nickname;
    let nickNameNode = username.cloneNode(true);
    nickNameNode.textContent = nickname;
    username.hidden = true;
    introContainer.appendChild(nickNameNode);

    let icon = json.user.profilepic;
    let iconNode = profileIcon.cloneNode(true);
    profileIcon.hidden = true;
    let myIcon;
    if (json.user.profilepic) {
      myIcon = `/uploads/${icon}`;
    } else {
      myIcon = `/uploads/default_profile_pic.jpg`;
    }

    iconNode.src = myIcon;
    introContainer.appendChild(iconNode);

    // Rating system

    // Rating system -- comment

    let likeBtn = document.querySelector(".likeBtn");
    let dislikeBtn = document.querySelector(".dislikeBtn");

    if (json.currentUser == paramsName) {
      console.log(json.currentUser, paramsName);
      // likeBtn.hidden = true;
      // dislikeBtn.hidden = true;
    }

    function comment(action) {
      let comment = { from: json.currentUser, to: +paramsName, action };
      fetch(`/comment`, {
        method: "post",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(comment),
      })
        .then((res) => {
          return res.json();
        })
        .then((message) => {
          console.log(message);
        });
    }

    likeBtn.addEventListener("click", () => {
      comment(1);
      showScore();
    });

    dislikeBtn.addEventListener("click", () => {
      comment(-1);
      showScore();
    });

    // Rating System -- show comment qty / show score

    let commentQty = document.querySelector(".commentQty");
    let score = document.querySelector(".score");

    function showScore() {
      fetch(`/score?id=${paramsName}`)
        .then((res) => {
          return res.json();
        })
        .then((result) => {
          // Rating System -- show comment qty

          commentQty.textContent = "評級人數: " + result.commentQty;

          // Rating System -- show score

          if (result.commentQtyEnough) {

            if (result.avgScore >= 90) {
              score.textContent = "評級: 壓倒性好評";
            } else if (result.avgScore >= 60) {
              score.textContent = "評級: 極度好評";
            } else if (result.avgScore >= 30) {
              score.textContent = "評級: 大多好評";
            } else if (result.avgScore == 0) {
              score.textContent = "評級: 褒貶不一";
            } else if (result.avgScore <= -90) {
              score.textContent = "評級: 壓倒性負評";
            } else if (result.avgScore <= -60) {
              score.textContent = "評級: 極度負評";
            } else if (result.avgScore <= -30) {
              score.textContent = "評級: 大多負評";
            }
          } else {
            score.textContent = "評級: 數據不足";
          }
        });
    }
    showScore();
  });
//-------------------------------------------------''

updateProfileForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  let formData = new FormData();

  formData.append("newNickname", updateNickname.value);
  formData.append("newPassword", updatePassword.value);
  formData.append("newIcon", updateIcon.files[0]);
  formData.append("newDescription", dialogDetail.value);
  //console.log(formData);

  const res = await fetch(`/profileUpdate?id=${paramsName}`, {
    method: "post",
    body: formData,
  });
  console.log(res);
  if (res.ok) {
    Swal.fire({
      icon: "success",
      title: `Information updated`,
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) window.location.reload();
    });
  }

  // let json = await
});

//--------------------------------
//for portfolio
document
  .getElementById("exampleModal")
  .addEventListener("show.bs.modal", async (event) => {
    // console.log(event);
    outsideText = event.relatedTarget.querySelector(
      ".outsideDescription"
    ).innerHTML;
    insideText =
      event.currentTarget.querySelector(".insideDescription").innerHTML;

    console.log(event.relatedTarget);
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

descriptionBtn.addEventListener("click", async (event) => {
  // console.log(event);
  // let insideEdit = document.querySelector(".insideDescription");
  console.log(insideDescription);
  insideDescription.contentEditable = true;
});

doneBtn.addEventListener("click", async (event) => {
  let image = document.querySelector(".portfolio1");
  // let insideEdit = document.querySelector(".insideDescription");

  console.log(image.src);
  console.log(insideDescription);
  console.log(insideDescription.textContent);
  insideDescription.contentEditable = false;
  const res = await fetch(`/editDescription`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      content: insideDescription.textContent,
      image: image.src,
    }),
  });
  let json = await res.json();
  console.log(json);

  if (res.ok) {
    Swal.fire({
      icon: "success",
      title: `description updated`,
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) window.location.reload();
    });
  }
});

//for filter categories
fetch(`/filter?id=${paramsName}`)
  .then((res) => res.json())
  .then((categories) => {
    // console.log("categories.allCats: ", categories.allCats);
    // console.log("categories.muaCats: ", categories.muaCats);
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
      if (categories.currentUser != paramsName) {
        saveCatSubmit.hidden = true;
      }
      for (const cat of catsTree) {
        let node = catTemplate.cloneNode(true);
        let checkbox = node.querySelector("input");
        if (cat.children.length > 0) {
          checkbox.hidden = true;
          node.classList.add("rootCat");
        } else {
          node.classList.add("leafCat");
        }
        checkbox.value = cat.id;
        if (categories.muaCats.filter((word) => word == cat.id).length > 0) {
          checkbox.checked = true;
          // } else if (cat.children.length == 0){
          //   node.hidden = true
        }
        if (categories.currentUser != paramsName) {
          saveCatSubmit.hidden = true;
          checkbox.disabled = true;
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

//for filter
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

  tags.dates = selectedDatesMua;
  fetch(`/saveCat`, {
    method: "post",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(tags),
  })
    .then((res) => {
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: `preference updated`,
          showConfirmButton: true,
        }).then((result) => {
          if (result.isConfirmed) window.location.reload();
        });
      }
      return res.json();
    })
    .then((message) => {
      console.log(message);
    });
});

function showAvailableDate() {
      // console.log("selectedDatesMua: ", selectedDatesMua);
      let dates = document.querySelectorAll(".selectable");
      for (let date of dates) {
        if (selectedDatesMua.length !== 0) {
          for (let unavailable_date of selectedDatesMua) {
            if (date.id == unavailable_date) {
              if (date.classList.contains("selected")) {
                date.classList.remove("selected");
              }
              break;
            }
            date.classList.add("selected");
          }
        } else {
          date.classList.add("selected");
        }
      }
}

fetch(`/selectedDatesMua?id=${paramsName}`)
  .then((res) => res.json())
  .then((unavailable_dates) => {
    for (let unavailable_date of unavailable_dates) {
      selectedDatesMua.push(unavailable_date.date);
    }
    showAvailableDate();
  });

//for calendar

