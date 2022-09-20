let portfolioContainer = document.querySelector(".btnContainer");
let portfolioBtn = portfolioContainer.querySelector(".imageBtn");
let deleteBtn = document.querySelector(".deleteBtn");
let params = new URL(document.location).searchParams;
let paramsName = params.get("id");

fetch(`/adminProfile`)
  .then((res) => res.json())
  .then((reportedData) => {
    console.log(reportedData);
    console.log(reportedData.admin);
    for (let data of reportedData.admin) {
      console.log(data.muas_description);
      let node = portfolioBtn.cloneNode(true);
      let nodeContent = node.querySelector(".portfolio");
      let nodeDescription = node.querySelector(".outsideDescription");
      let outsideMua_id = node.querySelector(".outsideMua_id");
      let photo = `/uploads/${data.muas_image}`;
      nodeDescription.textContent = `${data.muas_description}`;
      nodeContent.src = photo;
      outsideMua_id.textContent = `${data.muas_id}`;
      portfolioContainer.appendChild(node);
      portfolioBtn.remove();
    }
    // console.log(reportedData.isAdmin.isadmin);
    if (reportedData.isAdmin.isadmin == false) {
      window.location = "/";
    }
  });

deleteBtn.addEventListener("click", async (event) => {
  let insideImage = event.path[2]
    .querySelector(".portfolio1")
    .src.split("/")
    .slice(4);

  event.preventDefault();

  let res = await fetch("/adminDelete", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ insideImage }),
  });
  console.log(res);

  if (res.ok) {
    Swal.fire({
      icon: "success",
      title: `作品已成功刪除`,
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) window.location.reload();
    });
  }
  let json = await res.json();
  console.log(json);
});

document
  .getElementById("exampleModal")
  .addEventListener("show.bs.modal", async (event) => {
    console.log(event);
    outsideId = event.relatedTarget.querySelector(".outsideMua_id").innerHTML;
    insideId = event.currentTarget.querySelector(".insideMuaID");
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
    insideId = outsideId;
    console.log(insideText);
    // console.log(event.currentTarget);
    event.currentTarget.querySelector(".portfolio1").src = insideImage;
    event.currentTarget.querySelector(".insideDescription").innerHTML =
      insideText;
    event.currentTarget.querySelector(".insideMuaID").innerHTML = insideId;
    // event.currentTarget.querySelector(".insideMuaID").hidden = true;
  });
