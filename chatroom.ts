import { Socket } from "dgram";
import express, { Request, Response, NextFunction, Router } from "express";
import { Server } from "socket.io";
import { client } from "./database";
import "./session";

export function getChatroomRoutes(io: Server) {
  let chatroomRoutes = Router();

  io.on("connection", async (socket) => {
    let req = socket.request as Request;
    let user_id = req.session?.user?.id;

    let result = await client.query("select isadmin from users where id = $1", [
      user_id,
    ]);
    let user = result.rows[0];
    let is_admin = user?.isadmin;

    socket.on("join_room", (room_user_id) => {
      if (room_user_id == user_id || is_admin) {
        socket.join("room:" + room_user_id);
      }
    });
    socket.on("quit_room", (room_user_id) => {
      socket.leave("room:" + room_user_id);
    });
  });

  console.log("New WS Connection.....");
  chatroomRoutes.post(
    "/chatroomMessage",
    async (req: Request, res: Response) => {
      let user_id = req.session?.user?.id;
      const content = req.body.message;
      let room_user_id = req.body.room_user_id;

      let result = await client.query(
        `select isadmin from users where id = $1`,
        [user_id]
      );
      let user = result.rows[0];
      if (!user) {
        res.status(401);
        res.end();
        return;
      }
      let isadmin = user.isadmin;
      if (!isadmin) {
        room_user_id = user_id;
      }
      console.log(isadmin);
      //   console.log(isadmin ? req.body.talkerID : user_id, content, !isadmin);

      await client.query(
        `insert into chatroom (user_id, content, toadmin) values ($1,$2,$3)`,
        [room_user_id, content, !isadmin]
      );
      // io.emit("message", { content, isadmin, room_user_id });
      io.to("room:" + room_user_id).emit("message", {
        content,
        isadmin,
        room_user_id,
      });
    }
  );

  chatroomRoutes.get("/chatroomMessage", async (req, res) => {
    let userID = +req.session.user?.id!;
    let room_user_id = +req.query.id!;
    console.log(req.query);
    let result = await client.query(`select isadmin from users where id=$1`, [
      userID,
    ]);
    let isadmin = result.rows[0]?.isadmin;

    if (!isadmin) {
      room_user_id = userID;
    }

    result = await client.query(`select * from chatroom where user_id = $1`, [
      room_user_id,
    ]);
    let messages = result.rows;
    result = await client.query(`select username from users where id=$1`, [
      room_user_id,
    ]);
    let room_username = result.rows[0]?.username;

    res.json({ messages, isadmin, room_username, userID, room_user_id });
  });

  io.on("connection", (socket) => {
    const botName = "MUA Bot";
    let req = socket.request as Request;
    let user_id = req.session?.user?.id;

    io.on("joinRoom", ({ username, room }: any) => {
      // welcome current user
      socket.emit("message", "Welcome to MUA, How may I help you?");
    });
  });
  //   chatroomRoutes.get("/checkThirdParty", async (req, res) => {
  //     let current_visitor = req.session.user?.id;
  //     let room_host = +req.query.id!;

  //     if (current_visitor === room_host) {
  //       res.json({ check: true });
  //     } else {
  //       res.json({ check: false });
  //     }

  //     console.log(current_visitor, room_host);
  //   });

  return chatroomRoutes;
}
