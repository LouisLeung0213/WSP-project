fetch("/sorchu")
  .then((res) => res.json())
  .then((categories) => {
    
    console.log(categories);
});

