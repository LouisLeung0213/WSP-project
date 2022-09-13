fetch("/sorchu")
  .then((res) => res.json())
  .then((categories) => {
    console.log(categories);
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
    console.dir(catsTree, { depth: 20 });

    let catList = document.querySelector(".cat-list")
    let catTemplate = catList.querySelector(".cat")


    function showCats(categories, catList){
        catList.textContent = ''
        for (const cat of categories) {
            let node = catTemplate.cloneNode(true)
            node.textContent = cat
            catList.appendChild(node)
            break
        }
    }

    showCats(categories, catList)


  });
