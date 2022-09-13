fetch("/filter")
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


    function showCats(catsTree, catList){
        catList.textContent = ''
        for (const cat of catsTree) {
            console.log(cat.name)
            let node = catTemplate.cloneNode(true)
            node.textContent = cat.name
            catList.appendChild(node)
            
            showCats(node.children, catList)
 
        }
    }

    showCats(catsTree, catList)


  });

