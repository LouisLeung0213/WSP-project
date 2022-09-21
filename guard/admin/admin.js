let portfolioContainer = document.querySelector(".btnContainer");
let portfolioBtn = portfolioContainer.querySelector(".imageBtn");
let deleteBtn = document.querySelector(".deleteBtn");
let cancelBtn = document.querySelector(".cancelBtn");
let userBtn = document.querySelector(".users");
let bannedUserBtn = document.querySelector(".bannedUsers");
// let userBanBtn;
let usersContainer = document.querySelector(".usersContainer");
let bannedUsersContainer = document.querySelector(".bannedUsersContainer");
let params = new URL(document.location).searchParams;
let paramsName = params.get("id");

fetch(`/adminProfile`)
  .then((res) => res.json())
  .then((reportedData) => {
    for (let data of reportedData.admin) {
      console.log(data.muas_description);
      let node = portfolioBtn.cloneNode(true);
      console.log(node);
      let nodeContent = node.querySelector(".portfolio");
      let nodeDescription = node.querySelector(".outsideDescription");
      let outsideMua_id = node.querySelector(".outsideMua_id");
      let reportReason = node.querySelector(".reportReason");
      let photo = `/uploads/${data.muas_image}`;
      reportReason.innerHTML = `${data.reason}`;
      nodeDescription.textContent = `${data.muas_description}`;
      nodeContent.src = photo;
      outsideMua_id.textContent = `${data.muas_id}`;
      portfolioContainer.appendChild(node);
      portfolioBtn.remove();
      // userBanBtn = node.querySelector(".users");
    }
    // console.log(reportedData.isAdmin.isadmin);
    // if (reportedData.isAdmin.isadmin == false) {
    //   window.location = "/";
    // }
  });
// let userArray = [];

fetch("/userInfo")
  .then((res) => res.json())
  .then((muaInfos) => {
    for (let muaInfo of muaInfos.json) {
      // console.log(muaInfo);
      let node = userBtn.cloneNode(true);
      // userArray.push(node);
      // console.log(userArray);
      // for (let i = 0; i < userArray.length; i++) {
      node.addEventListener("click", async (event) => {
        let usersUsername =
          event.currentTarget.querySelector(".usersUsername").textContent;
        let usersId = event.currentTarget.querySelector(".usersID").textContent;
        console.log(usersUsername, usersId);
        let res = await fetch("/adminBan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ usersUsername, usersId }),
        });
        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: `此用戶已被永久BAN`,
            showConfirmButton: true,
          }).then((result) => {
            if (result.isConfirmed) window.location.reload();
          });
        } // console.log("hihi");
        let json = await res.json();
        console.log(json);
      });
      // }
      let nodeUsername = node.querySelector(".usersUsername");
      let nodeIcon = node.querySelector(".usersIcon");
      let nodeId = node.querySelector(".usersID");
      nodeUsername.innerHTML = `${muaInfo.username}`;
      nodeIcon.src = `/uploads/${muaInfo.profilepic}`;
      nodeId.innerHTML = `${muaInfo.muas_id}`;
      usersContainer.appendChild(node);
      userBtn.remove();
    }
    // userBanBtn = node.querySelector(".users");
  });

fetch("/bannedUser")
  .then((res) => res.json())
  .then((bannedUsers) => {
    console.log(bannedUsers);
    for (let bannedUser of bannedUsers.json) {
      let node = bannedUserBtn.cloneNode(true);
      node.addEventListener("click", async (event) => {
        let bannedUsername =
          event.currentTarget.querySelector(".bannedUsername").textContent;
        let bannedUsersId =
          event.currentTarget.querySelector(".bannedUserId").textContent;
        console.log(bannedUsername, bannedUsersId);
        let res = await fetch("/unBan", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ bannedUsername, bannedUsersId }),
        });
        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: `已解除封鎖`,
            showConfirmButton: true,
          }).then((result) => {
            if (result.isConfirmed) window.location.reload();
          });
        }
      });
      let nodeBannedUsername = node.querySelector(".bannedUsername");
      // let nodeBannedIcon = node.querySelector(".bannedUsersIcon");
      let nodeBannedId = node.querySelector(".bannedUserId");
      nodeBannedUsername.innerHTML = `${bannedUser.muas_username}`;
      // nodeIcon.src = `/uploads/${bannedUser.profilepic}`;
      nodeBannedId.innerHTML = `${bannedUser.muas_id}`;
      bannedUsersContainer.appendChild(node);
      bannedUserBtn.remove();
    }
  });

cancelBtn.addEventListener("click", async (event) => {
  let insideImage = event.path[2]
    .querySelector(".portfolio1")
    .src.split("/")
    .slice(4);

  let res = await fetch("/adminCancel", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ insideImage }),
  });
  console.log(res);
  if (res.ok) {
    Swal.fire({
      icon: "success",
      title: `作品已取消檢舉`,
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) window.location.reload();
    });
  }
  let json = await res.json();
  console.log(json);
});

deleteBtn.addEventListener("click", async (event) => {
  let insideID = event.path[3].querySelector(".insideMuaID").textContent;
  let insideDescription =
    event.path[3].querySelector(".insideDescription").textContent;
  let insideImage = event.path[2]
    .querySelector(".portfolio1")
    .src.split("/")
    .slice(4);

  event.preventDefault();

  let res = await fetch("/adminDelete", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ insideImage, insideID, insideDescription }),
  });
  console.log(res);

  if (res.ok) {
    Swal.fire({
      icon: "success",
      title: `作品已成功下架`,
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
    outsideReason =
      event.relatedTarget.querySelector(".reportReason").innerHTML;
    insideReason = event.currentTarget.querySelector(".insideReason").innerHTML;
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
    insideReason = outsideReason;
    console.log(insideText);
    // console.log(event.currentTarget);
    event.currentTarget.querySelector(".portfolio1").src = insideImage;
    event.currentTarget.querySelector(".insideDescription").innerHTML =
      insideText;
    event.currentTarget.querySelector(".insideMuaID").innerHTML = insideId;
    event.currentTarget.querySelector(".insideReason").innerHTML = insideReason;
    // event.currentTarget.querySelector(".insideMuaID").hidden = true;
  });
