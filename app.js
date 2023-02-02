/* Dependencies */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const flash = require('express-flash');
const compression = require('express-compression');
const minifyHTML = require('express-minify-html-2');
var passport = require('passport');
const { pageCompress, sessionSecret } = require('./libs/configloader');

/* Import routes */
const campaignsRouter = require('./routes/campaigns');
const homeRouter = require('./routes/home');
const createCampaignRouter = require('./routes/createcampaign');
const editCampaignRouter = require('./routes/editcampaign');
const agentDistribution = require('./routes/agentdistribution');
const agentProvision = require('./routes/agentprovision');
const inboundNumberProvision = require('./routes/inboundnumberprovision');
const fault = require('./routes/fault');
const campaignDashboardRouter = require('./routes/campaigndashboard');
const agentDashboardRouter = require('./routes/agentdashboard');
const agentWiseReportRouter = require('./routes/agentwisereport');
const campaignWiseReportRouter = require('./routes/campaignwisereport');
const authRouter = require('./routes/auth');
const unauthorizedRouter = require('./routes/unauthorized');


/* Set app */
const app = express();
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
if (pageCompress == 1) {
  console.log("PAGE COMPRESSION ON");
  app.use(minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: false,
      removeAttributeQuotes: false,
      removeEmptyAttributes: false,
      minifyJS: true
    }
  }));
  app.use(compression());
} // end if page compress
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 36000 },
}));
app.use(passport.authenticate('session'));
app.use(flash());



app.use(function (req, res, next) {
  console.log("AUTH_DEBUG: FROM MIDDLEWIRE FOR VIEW", req.user)
  if (req.user) {
    res.locals.currentUser = req.user;
  } else {
    res.locals.currentUser = {
      username: null,
      admin: null
    };
  }
  next();
});

const checkAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login")
  }
  next();
}

const checkAuthenticatedAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login")
  } else {
    if (req.user.admin == 1) {
      next();
    }
    else {
      res.redirect('unauthorized');
    }
  }
}


const checkAuthenticatedNonAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login")
  } else {
    if (!req.user.admin) {
      next();
    }
    else {
      res.redirect('unauthorized');
    }
  }
}


/* Register routes */

/* Common Routes for both Admin and Non Admin */
app.use('/', homeRouter);
app.use('/', authRouter);
app.use('/fault', fault);
app.use('/unauthorized', checkAuthenticated, unauthorizedRouter);

/* Admin only Routes */
app.use('/campaigns', checkAuthenticatedAdmin, campaignsRouter);
app.use('/create-campaign', checkAuthenticatedAdmin, createCampaignRouter);
app.use('/edit-campaign', checkAuthenticatedAdmin, editCampaignRouter);
app.use('/agent-provision', checkAuthenticatedAdmin, agentProvision);
app.use('/agent-distribution', checkAuthenticatedAdmin, agentDistribution);
app.use('/inbound-number-provision', checkAuthenticatedAdmin, inboundNumberProvision);
app.use('/campaign-dashboard', checkAuthenticatedAdmin, campaignDashboardRouter);
app.use('/agent-wise-report', checkAuthenticatedAdmin, agentWiseReportRouter);
app.use('/campaign-wise-report', checkAuthenticatedAdmin, campaignWiseReportRouter);

/* Non Admin Routes */
app.use('/agent-dashboard', checkAuthenticatedNonAdmin, agentDashboardRouter);

/* Catch 404 and forward to error handler */
app.use((req, res, next) => {
  next(createError(404));
});

/* Error handler */
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
