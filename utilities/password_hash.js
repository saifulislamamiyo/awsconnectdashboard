const bcrypt = require('bcrypt');

let uname = process.argv[2]
let hash = bcrypt.hashSync(uname, 15);
console.log("Username:", uname);
console.log("Encrypted Password:", hash);




