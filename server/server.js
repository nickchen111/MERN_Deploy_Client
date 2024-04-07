const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");
const path = require("path");
const port = process.env.PORT || 8080; // HEROKU自動動態設定的

// 連結mongoDB
mongoose
  .connect(process.env.MONGODB_CONNECTION) // "mongodb://localhost:27017/mernDB"本地的話
  .then(() => {
    console.log("Connecting to mongodb...");
  })
  .catch((e) => {
    console.log(e);
  });

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "client", "build")));

app.use("/api/user", authRoute);
// courseRoute 應該被jwt保護
//如果request header內部沒有jwt 則request就會被視為unauthorized
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

//將網頁部署到雲端伺服器後 如果有接收到除了上面兩個的URL的話 就會導向下面的
// production staging 都是部署上去後會有的值 NODE_ENV會自動建立
if (process.env.NODE_ENV == "production" || process.env.NODE_ENV == "staging") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

//只有登入系統的人才能夠去新增課程或是註冊課程
//驗證jwt token

app.listen(port, () => {
  console.log("後端伺服器聆聽port 8080");
});
