let portfolioContainer = document.querySelector(".btnContainer");
let portfolioBtn = portfolioContainer.querySelector(".imageBtn");
let permanentDeleteBtn = document.querySelector(".permanentDeleteBtn");
let restBtn = document.querySelector(".restBtn");

fetch(`/deletedPortfolio`)
  .then((res) => res.json())
  .then((reportedData) => {
    console.log(reportedData);
    for (let data of reportedData.json) {
      console.log(data);
      console.log(data.muas_description);
      let node = portfolioBtn.cloneNode(true);
      let nodeContent = node.querySelector(".portfolio");
      let nodeDescription = node.querySelector(".outsideDescription");
      let outsideMua_id = node.querySelector(".outsideMua_id");
      //   let reportReason = node.querySelector(".reportReason");
      let photo = `/uploads/${data.muas_image}`;
      //   reportReason.innerHTML = `${data.reason}`;
      nodeDescription.textContent = `${data.muas_description}`;
      nodeContent.src = photo;
      outsideMua_id.textContent = `${data.muas_id}`;
      portfolioContainer.appendChild(node);
      portfolioBtn.remove();
    }
    // console.log(reportedData.isAdmin.isadmin);
    // if (reportedData.isAdmin.isadmin == false) {
    //   window.location = "/";
    // }
  });

restBtn.addEventListener("click", async (event) => {
  let insideID = event.path[3].querySelector(".insideMuaID").textContent;
  let insideDescription =
    event.path[3].querySelector(".insideDescription").textContent;
  let insideImage = event.path[2]
    .querySelector(".portfolio1")
    .src.split("/")
    .slice(4);

  let res = await fetch("/adminRest", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ insideImage, insideID, insideDescription }),
  });
  console.log(res);
  if (res.ok) {
    Swal.fire({
      icon: "success",
      title: `作品已還原`,
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) window.location.reload();
    });
  }
  let json = await res.json();
  console.log(json);
});

permanentDeleteBtn.addEventListener("click", async (event) => {
  let insideImage = event.path[2]
    .querySelector(".portfolio1")
    .src.split("/")
    .slice(4);

  event.preventDefault();

  let res = await fetch("/adminPermanentDelete", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ insideImage }),
  });
  console.log(res);

  if (res.ok) {
    Swal.fire({
      icon: "success",
      title: `作品已永久刪除`,
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
    // outsideReason =
    //   event.relatedTarget.querySelector(".reportReason").innerHTML;
    // insideReason = event.currentTarget.querySelector(".insideReason").innerHTML;
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
    // insideReason = outsideReason;
    console.log(insideText);
    // console.log(event.currentTarget);
    event.currentTarget.querySelector(".portfolio1").src = insideImage;
    event.currentTarget.querySelector(".insideDescription").innerHTML =
      insideText;
    event.currentTarget.querySelector(".insideMuaID").innerHTML = insideId;
    // event.currentTarget.querySelector(".insideReason").innerHTML = insideReason;
    // event.currentTarget.querySelector(".insideMuaID").hidden = true;
  });
