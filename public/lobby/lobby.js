fetch("/filter")
  .then((res) => res.json())
  .then((categories) => {
    // console.log(categories);
    let catMap = new Map();
    let catsTree = [];

    for (const catRow of categories) {
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
        catList.appendChild(node);
        node.querySelector(".cat-name").textContent = cat.name;
        let subCatList = node.querySelector(".cat-list");
        // console.log(subCatList);

        showCats(cat.children, subCatList);
      }
    }

    showCats(catsTree, catList);
  });

fetch("/showMua")
  .then((res) => res.json())
  .then((muas) => {
    console.log(muas);
    let main = document.querySelector("#main");
    let subMain = document.querySelector("#subMain")
    let content = main.querySelector(".muaAbstract");
    for (const mua of muas) {
      content.hidden = false;
      let node = content.cloneNode(true);
      content.hidden = true;
      node.textContent = JSON.stringify(mua);
      subMain.appendChild(node);
    }
  });

  let searchFilter = document.querySelector("#searchFilter");
  
  searchFilter.addEventListener("submit", (event) => {
  event.preventDefault();
  let form = event.target;
  let params = [];
  for (let param of form) {
    if (param.checked) {
      params.push(`categories_id = ${param.value}`);
      // param.checked = 0
    }
  }
  // console.log(params);
  let main = document.querySelector("#main");
  fetch(`/searchFilter`, {
    method: "post",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(params),
  })
  .then((res) => {
    return res.json();
  })
  .then((muas) => {
    if (muas == "Err: empty filter"){
      console.log(muas);
      return
    }
    let subMain = document.querySelector("#subMain")
    subMain.textContent = "";
      console.log(muas);
      // let main = document.querySelector("#main");
      let content = main.querySelector(".muaAbstract");
      for (const mua of muas) {
        content.hidden = false;
        let node = content.cloneNode(true);
        content.hidden = true;
        node.textContent = JSON.stringify(mua);
        subMain.appendChild(node);
      }
    });
    
});

let logout = document.querySelector("#logoutBtn");
let becomeMua = document.querySelector("#becomeMua");

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
