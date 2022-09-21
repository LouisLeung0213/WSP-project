let main = document.querySelector("#main");
let subMain = document.querySelector("#subMain");
let muaAbstract = main.querySelector(".muaAbstract");
let muaHref = main.querySelector(".muaHref");
let adminLink = document.querySelector(".adminLink");
let prevPage = document.querySelector(".prevPage");
let nextPage = document.querySelector(".nextPage");
let searchFilter = document.querySelector("#searchFilter");
let pageCount = { currentPage: 1 };
let rootCatList = document.querySelector("#searchFilter > cat-list");
let searchFilterSubmit = document.querySelector(".searchFilterSubmit");
let pageBarSelect = document.querySelector(".pageBarSelect");
let pageBtn = document.querySelector(".pageBtn");
let pageBtnText = pageBtn.querySelector(".pageBtnText");
pageBtn.remove();

try {
  fetch(`/filter?id=${paramsName}`)
    .then((res) => res.json())
    .then((categories) => {
      // console.log(categories.allCats);
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
      let catCount = 0;
      function showCats(catsTree, catList) {
        catList.textContent = "";
        for (const cat of catsTree) {
          // console.log(cat.name);
          let node = catTemplate.cloneNode(true);
          let checkbox = node.querySelector("input");
          if (cat.children.length > 0) {
            checkbox.hidden = true;
            node.classList.add(`rootCat${catCount}`);
            node.classList.add(`rootnode`);
            catCount++;
          } else {
            node.classList.add("leafCat");
          }

          checkbox.value = cat.id;
          catList.appendChild(node);
          node.querySelector(".cat-name").textContent = cat.name;
          let subCatList = node.querySelector(".cat-list");
          // console.log(subCatList);

          showCats(cat.children, subCatList);
        }
      }

      showCats(catsTree, catList);
    });
} catch (error) {
  console.log(err);
}

function showMua(pageBtnCreated) {
  // console.log(pageCount);
  fetch("/showMua", {
    method: "post",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(pageCount),
  })
    .then((res) => res.json())
    .then((result) => {
      // console.log(result);
      subMain.textContent = "";
      for (const mua of result.muas) {
        if (mua) {
          // console.log(mua);
          muaAbstract.hidden = false;
          let node = muaAbstract.cloneNode(true);

          let muaName = mua.username;
          let muaId = mua.id;

          //aTag in portfolioBlock
          let aTag = node.querySelector(".muaHref");
          aTag.href = `../../profile/profile.html?id=${muaId}`;

          // nickname in portfolioBlock
          let nickname = mua.nickname;
          // console.log(muaName);
          let pDiv = node.querySelector(".nickname");
          if (nickname != null) {
            pDiv.textContent = `${nickname}`;
          } else {
            pDiv.textContent = `${muaName}`;
          }

          // average score
          let avgScore = node.querySelector(".avgScore");
          if (mua.comment_qty_enough) {
            if (mua.avg_score >= 90) {
              avgScore.textContent = "評級: 壓倒性好評";
            } else if (mua.avg_score >= 60) {
              avgScore.textContent = "評級: 極度好評";
            } else if (mua.avg_score >= 30) {
              avgScore.textContent = "評級: 大多好評";
            } else if (mua.avg_score == 0) {
              avgScore.textContent = "評級: 褒貶不一";
            } else if (mua.avg_score <= -90) {
              avgScore.textContent = "評級: 壓倒性負評";
            } else if (mua.avg_score <= -60) {
              avgScore.textContent = "評級: 極度負評";
            } else if (mua.avg_score <= -30) {
              avgScore.textContent = "評級: 大多負評";
            }
          } else {
            avgScore.textContent = `評級: 數據不足`;
          }

          // new member
          let newMem = node.querySelector(".newMember");
          if (mua.is_new !== true) {
            newMem.hidden = true;
          }

          // icon in portfolioBlock
          let icon = mua.profilepic;
          let iconImage = node.querySelector(".icon");
          if (mua.profilepic != null) {
            iconImage.src = `/uploads/${icon}`;
          } else {
            iconImage.src = `/uploads/default_profile_pic.jpg`;
          }
          //portfolio in portfolioBlock
          let portfolio = mua.mua_portfolio;
          let portfolioDiv = node.querySelector(".portfolioDiv");
          let portfolioImage = node.querySelector(".portfolioPhoto");

          if (portfolio.length > 0 && portfolio[0] != null) {
            for (let i = 0; i < 5; i++) {
              // console.log(photo);
              let clonePortfolio = portfolioImage.cloneNode(true);
              portfolioDiv.appendChild(clonePortfolio);
              clonePortfolio.src = `/uploads/${portfolio[i]}`;
            }
            let moreDiv = document.createElement("div");
            let more = document.createElement("div");
            moreDiv.classList.add("moreDiv");
            more.textContent = "查看更多...";
            moreDiv.appendChild(more);
            portfolioDiv.appendChild(moreDiv);
          } else {
            // portfolioImage.src = `/uploads/default_profile_pic.jpg`;
            portfolioImage.hidden = true;
          }
          portfolioImage.remove();
          // nodeContent.href = `../../profile/profile.html?id=${muaId}`;
          muaAbstract.hidden = true;
          // nodeContent.textContent = muaName;
          subMain.appendChild(node);
        }
      }
      // Change page in show mua

      if (!prevPage.classList.contains("forShowMua")) {
        prevPage.classList.remove("forSearchFilter");
        nextPage.classList.remove("forSearchFilter");
        prevPage.classList.add("forShowMua");
        nextPage.classList.add("forShowMua");
      }

      prevPage.addEventListener("click", () => {
        if (prevPage.classList.contains("forShowMua")) {
          if (pageCount.currentPage > 1) {
            pageCount.currentPage -= 1;
            showMua(true);
          } else {
            console.log("You are in the first page");
          }
        }
      });

      nextPage.addEventListener("click", () => {
        if (prevPage.classList.contains("forShowMua")) {
          if (pageCount.currentPage < result.maxPage) {
            pageCount.currentPage += 1;
            showMua(true);
          } else {
            console.log("You are in the final page");
          }
        }
      });

      // Select page in show mua

      if (pageBtnCreated == false) {
        for (let i = 1; i <= result.maxPage; i++) {
          // Clone button

          let node = pageBtn.cloneNode(true);
          let nodeText = node.querySelector(".pageBtnText");
          nodeText.textContent = i;
          pageBarSelect.appendChild(node);

          // Add click event listener

          node.addEventListener("click", () => {
            if (
              pageCount.currentPage != i &&
              prevPage.classList.contains("forShowMua")
            ) {
              pageCount.currentPage = i;
              showMua(true);
            }
          });
        }
      }

      // Light up selected button

      let pageBtns = document.querySelectorAll(".pageBtn");

      for (let i = 1; i <= pageBtns.length; i++) {
        pageBtns[i - 1].classList.remove("pageBtnSelected");
        if (pageCount.currentPage == i) {
          pageBtns[i - 1].classList.add("pageBtnSelected");
        }
      }
    });
}
showMua(false);

searchFilter.addEventListener("submit", (event) => {
  event.preventDefault();
  pageCount.currentPage = 1;
  function searchFilter(pageBtnCreated) {
    let form = event.target;
    // console.log(form);
    let filterOptions = {
      cats: [],
      dates: [],
      currentPage: pageCount.currentPage,
    };
    for (let cat of form) {
      if (cat.checked) {
        filterOptions.cats.push(+cat.value);
        console.log("cat selected: ", cat);
      }
    }
    // console.log(params);
    // console.log(selectedDates);
    // console.log(selectedDatesStr);
    filterOptions.dates = selectedDatesStr;

    fetch(`/searchFilter`, {
      method: "post",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(filterOptions),
    })
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        if (result == "Err: empty filter") {
          subMain.textContent = "";
          let pageBtns = document.querySelectorAll(".pageBtn");
          for (let pageBtn of pageBtns) {
            pageBtn.remove();
          }
          showMua(false);
          console.log(result);
          return;
        }
        // console.log(result);
        subMain.textContent = "";

        // console.log(muas);
        for (const mua of result.muasUnique) {
          muaAbstract.hidden = false;
          let node = muaAbstract.cloneNode(true);

          let muaName = mua.username;
          let muaId = mua.mua_id;
          let avg_score = mua.avg_score;
          //aTag in portfolioBlock
          let aTag = node.querySelector(".muaHref");
          aTag.href = `/profile/profile.html?id=${muaId}`;

          // nickname in portfolioBlock
          let nickname = mua.nickname;
          // console.log(muaName);
          let pDiv = node.querySelector(".nickname");
          if (nickname != null) {
            pDiv.textContent = `${nickname}`;
          } else {
            pDiv.textContent = `${muaName}`;
          }

          // average score
          let avgScore = node.querySelector(".avgScore");
          if (mua.comment_qty_enough) {
            if (mua.avg_score >= 90) {
              avgScore.textContent = "評級: 壓倒性好評";
            } else if (mua.avg_score >= 60) {
              avgScore.textContent = "評級: 極度好評";
            } else if (mua.avg_score >= 30) {
              avgScore.textContent = "評級: 大多好評";
            } else if (mua.avg_score == 0) {
              avgScore.textContent = "評級: 褒貶不一";
            } else if (mua.avg_score <= -90) {
              avgScore.textContent = "評級: 壓倒性負評";
            } else if (mua.avg_score <= -60) {
              avgScore.textContent = "評級: 極度負評";
            } else if (mua.avg_score <= -30) {
              avgScore.textContent = "評級: 大多負評";
            }
          } else {
            avgScore.textContent = `評級: 數據不足`;
          }

          // new member
          let newMem = node.querySelector(".newMember");
          if (mua.is_new !== true) {
            newMem.hidden = true;
          }

          // icon in portfolioBlock
          let icon = mua.profilepic;
          let iconImage = node.querySelector(".icon");
          if (mua.profilepic != null) {
            iconImage.src = `/uploads/${icon}`;
          } else {
            iconImage.src = `/uploads/default_profile_pic.jpg`;
          }

          //portfolio in portfolioBlock
          let portfolio = mua.mua_portfolio;
          let portfolioDiv = node.querySelector(".portfolioDiv");
          let portfolioImage = node.querySelector(".portfolioPhoto");

          if (portfolio.length > 0 && portfolio[0] != null) {
            for (let i = 0; i < 5; i++) {
              // console.log(photo);
              let clonePortfolio = portfolioImage.cloneNode(true);
              portfolioDiv.appendChild(clonePortfolio);
              clonePortfolio.src = `/uploads/${portfolio[i]}`;
            }
            let moreDiv = document.createElement("div");
            let more = document.createElement("div");
            moreDiv.classList.add("moreDiv");
            more.textContent = "查看更多...";
            moreDiv.appendChild(more);
            portfolioDiv.appendChild(moreDiv);
          } else {
            // portfolioImage.src = `/uploads/default_profile_pic.jpg`;
            portfolioImage.hidden = true;
          }
          portfolioImage.remove();
          // nodeContent.href = `../../profile/profile.html?id=${muaId}`;
          muaAbstract.hidden = true;
          // nodeContent.textContent = muaName;
          subMain.appendChild(node);
        }

        // Change page in search filter
        if (!prevPage.classList.contains("forSearchFilter")) {
          prevPage.classList.remove("forShowMua");
          nextPage.classList.remove("forShowMua");
          prevPage.classList.add("forSearchFilter");
          nextPage.classList.add("forSearchFilter");
        }

        prevPage.addEventListener("click", () => {
          if (prevPage.classList.contains("forSearchFilter")) {
            if (pageCount.currentPage > 1) {
              pageCount.currentPage -= 1;
              searchFilter(true);
            } else {
              console.log("You are in the first page");
            }
          }
        });

        nextPage.addEventListener("click", () => {
          if (prevPage.classList.contains("forSearchFilter")) {
            if (pageCount.currentPage < result.maxPage) {
              pageCount.currentPage += 1;
              searchFilter(true);
            } else {
              console.log("You are in the final page");
            }
          }
        });

        if (pageBtnCreated == false) {
          let pageBtns1 = document.querySelectorAll(".pageBtn");
          for (let pageBtn of pageBtns1) {
            pageBtn.remove();
          }
          for (let i = 1; i <= result.maxPage; i++) {
            // Clone button

            let node = pageBtn.cloneNode(true);
            let nodeText = node.querySelector(".pageBtnText");
            nodeText.textContent = i;
            pageBarSelect.appendChild(node);

            // Light up selected button

            // if (pageCount.currentPage == i){
            //  node.classList.add("pageBtnSelected");
            // }

            // Add click event listener

            node.addEventListener("click", () => {
              if (
                pageCount.currentPage != i &&
                prevPage.classList.contains("forSearchFilter")
              ) {
                pageCount.currentPage = i;
                searchFilter(true);
              }
            });
          }
        }

        let pageBtns2 = document.querySelectorAll(".pageBtn");

        // Light up selected button

        for (let i = 1; i <= pageBtns2.length; i++) {
          pageBtns2[i - 1].classList.remove("pageBtnSelected");
          if (pageCount.currentPage == i) {
            pageBtns2[i - 1].classList.add("pageBtnSelected");
          }
        }

        // for (let i = 1; i <= pageBtns.length; i++) {
        //   pageBtns[i - 1].addEventListener("click", () => {
        //     if (
        //       pageCount.currentPage != i &&
        //       prevPage.classList.contains("forSearchFilter")
        //     ) {
        //       pageCount.currentPage = i;
        //       searchFilter();
        //     }
        //   });
        //   pageBtns[i - 1].classList.remove("pageBtnSelected");
        //   if (pageCount.currentPage == i) {
        //     pageBtns[i - 1].classList.add("pageBtnSelected");
        //   }
        // }
      });
  }
  searchFilter(false);
});

let logout = document.querySelector("#logoutBtn");
let becomeMua = document.querySelector("#becomeMua");
let profileTemplate = document.querySelector(".profileTemplate");
let profileShowDiv = document.querySelector(".profileShowDiv");

//logout function
logout.addEventListener("click", async (event) => {
  event.preventDefault();
  let res = await fetch("/logout", {
    method: "post",
  });
  if (res.ok) {
    window.location = "/index.html";
  }
});

//TODO SIGN UP後立即LOGIN

window.onload = async () => {
  const res = await fetch("/isMua");
  if (res.status == 200) {
    becomeMua.hidden = true;

    let json = await res.json();

    // console.log(json);
    //show profile node
    // let node = profileTemplate.cloneNode(true);
    profileTemplate.hidden = true;
    let alink = document.createElement("a");
    alink.href = `/profile/profile.html?id=${json.id}`;
    let image = document.createElement("img");
    if (json.pic) {
      image.src = `/uploads/${json.pic}`;
    } else {
      image.src = `/uploads/default_profile_pic.jpg`;
    }
    image.alt = "icon";
    image.id = "profileIcon";
    profileShowDiv.appendChild(alink);
    alink.appendChild(image);
  }
};

becomeMua.addEventListener("click", async (event) => {
  event.preventDefault();
  let res = await fetch("/registration", {
    method: "post",
  });

  let json = await res.json();
  console.log(json);
  if (res.ok) {
    Swal.fire({
      icon: "success",
      title: `Welcome join Makeup Artist`,
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        becomeMua.hidden = true;
        window.location = "/lobby/lobby.html";
      }
    });
  }
});

fetch("/checkIsAdmin")
  .then((res) => res.json())
  .then((id) => {
    // console.log(id.isAdmin);
    if (id.isAdmin.isadmin == false) {
      adminLink.hidden = true;
    }
  });
