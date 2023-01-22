const bcrypt = require('bcrypt');

let usernames = ['nazim', 'saiful', 'asif'];

usernames.forEach((uname)=>{
  let hash = bcrypt.hashSync(uname, 15);
  console.log(uname, hash);
});




