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

    let checkboxes = document.querySelectorAll("#filterCheckbox");

    for (let checkbox of checkboxes) {
      checkbox.addEventListener("click", () => {
        console.log(checkbox.value);
      });
    }
  });

let searchFilter = document.querySelector("#searchFilter");
let logout = document.querySelector("#logoutBtn");

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
  console.log(params);

  // fetch(`/searchFilter?${params.join('&')}`, {
  //   method: "get",
  // }).then((res) => {
  //   console.log(res)
  // });
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
    .then((data) => console.log(data));
});

logout.addEventListener("click", async (event) => {
  event.preventDefault();
  let res = await fetch("/logout", {
    method: "post",
  });
  if (res.ok) {
    window.location = "/index.html";
  }
});
