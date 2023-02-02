const defaultUser = {
  userId: "default",
  userName: "default",
}


const logIn = (req, chekedUser) => {
  req.session.isLoggedIn = 1;
  req.session.username = chekedUser[0];
  req.session.admin = chekedUser[1];
}
const logOut = (req) => {
  req.session.isLoggedIn = 0;
  req.session.username = '';
  req.session.admin = -1;
}




const allowAdminAndNonAdmin = (req, res, next) => {
  if (req.session.isLoggedIn == 1) {
    next()
  }
  else {
    logOut(req);
    req.flash("danger", "Please login to view this page");
    res.redirect("/auth/login");
  }
}

const allowAdminOnly = (req, res, next) => {
  if (req.session.isLoggedIn == 1 && req.session.admin == 1) {
    next()
  }
  else {
    logOut(req);
    req.flash("danger", "Please login as an Admin User to view this page.");
    res.redirect("/auth/login");
  }
}


module.exports = { defaultUser, logIn, logOut, allowAdminAndNonAdmin, allowAdminOnly }