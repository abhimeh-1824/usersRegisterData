const express = require("express");
const fs = require("fs");
const app = express();
const filePath = "./user.json";
const crypto = require("crypto");
app.use(express.json());

// create data sava in file.
const saveUserData = (userData) => {
  const stringifyData = JSON.stringify(userData);
  fs.writeFileSync("./user.json", stringifyData);
};

// read file
const readUserData = () => {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

// get all user data
app.get("/", (req, res) => {
  const existUsers = readUserData();
  res.send({ success: true, existUsers });
});

// update user data
app.patch("/user/update/:id", (req, res) => {
  try {
    const existUsers = readUserData();
    const userId = req.params.id;
    let bool = false;
    let obj;
    for (var i = 0; i < existUsers.length; i++) {
      if (userId == existUsers[i].id) {
        bool = true;
        obj = existUsers[i];
        break;
      }
    }
    if (bool) {
      let myuserkey = crypto.createCipher("aes-128-cbc", "mypassword");
      let myuserpassword = myuserkey.update(req.body.password, "utf8", "hex");
      myuserpassword += myuserkey.final("hex");
      obj["password"] =
        req.body.password == undefined ? obj["password"] : myuserpassword;
      obj["email"] =
        req.body.email == undefined ? obj["email"] : req.body.email;
      obj["name"] = req.body.name == undefined ? obj["name"] : req.body.name;
      console.log(obj);
      existUsers[i] = obj;
      saveUserData(existUsers);
      res.send({ success: true, message: "update succefull" });
    } else {
      res.send({ message: "user not found" });
    }
  } catch (error) {
    res.send({ error: error.message });
  }
});

// delete user data
app.delete("/user/delete/:id", (req, res) => {
  try {
    const existUsers = readUserData();
    const userId = req.params.id;
    let bool = false;
    let obj;
    for (var i = 0; i < existUsers.length; i++) {
      if (userId == existUsers[i].id) {
        bool = true;
        delete existUsers[i];
        break;
      }
    }
    if (bool) {
      saveUserData(existUsers);
      res.send({ success: true, message: "delete succefull" });
    } else {
      res.send({ message: "user not found" });
    }
  } catch (error) {
    res.send({ error: error.message });
  }
});

// user login
app.post("/login", (req, res) => {
  try {
    var existUsers = readUserData();
    var login = false;
    for (var i = 0; i < existUsers.length; i++) {
      var mykey = crypto.createDecipher("aes-128-cbc", "mypassword");
      var mystr = mykey.update(existUsers[i].password, "hex", "utf8");
      mystr += mykey.final("utf8");
      if (
        mystr === req.body.password &&
        existUsers[i].email === req.body.email
      ) {
        login = true;
        break;
      }
    }
    if (login) {
      res.send({ success: true, message: "account successfully Login" });
    } else {
      res.send({ success: false, message: "email password not match !!!!" });
    }
  } catch (error) {
    res.send({ error: error.message });
  }
});

// user register
app.post("/register", (req, res) => {
  try {
    var existUsers = readUserData();
    // check user exist or not
    var check = false;
    for (var i = 0; i < existUsers.length; i++) {
      if (existUsers[i].email === req.body.email) {
        console.log(existUsers[i].email);
        check = true;
        break;
      }
    }
    if (check) {
      res.send({ success: false, message: "account already exit" });
    } else {
      const newUserId = Math.floor(100000 + Math.random() * 900000);
      let id = "userId" + newUserId;
      let myuserkey = crypto.createCipher("aes-128-cbc", "mypassword");
      let myuserpassword = myuserkey.update(req.body.password, "utf8", "hex");
      let obj = req.body;
      myuserpassword += myuserkey.final("hex");
      obj["id"] = id;
      obj["password"] = myuserpassword;
      existUsers.push(obj);
      saveUserData(existUsers);
      res.status(200).send({
        success: true,
        msg: "user Registration Susscefull successfully",
      });
    }
  } catch (error) {
    res.send({ error: error.message });
  }
});

app.listen("8085", () => {
  try {
    console.log("working on 8085");
  } catch (error) {
    throw error;
  }
});
