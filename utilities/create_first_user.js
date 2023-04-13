const bcrypt = require('bcrypt');
const { passwordHashSaltRounds } = require("../libs/configloader");
const { createUser } = require("../libs/ddbclient");

const USER_NAME="admin";
const USER_PASS="admin123";
const USER_TYPE = 1;



(async () => {
  try {
    console.log("Creating first Admin User");
    let hashedPassword = bcrypt.hashSync(USER_PASS, passwordHashSaltRounds);
    await createUser(USER_NAME, hashedPassword, USER_TYPE);
    console.log(`First Admin User created. USER_NAME:${USER_NAME}  USER_PASS:${USER_PASS}`);
  } catch (e) {
    console.log("Error creating first Admin User");
    console.log(e);
  }
})()

