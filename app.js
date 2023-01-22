/* Dependencies */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const flash = require('express-flash');
const compression = require('express-compression');
const minifyHTML = require('express-minify-html-2');
const { pageCompress, sessionSecret } = require('./libs/configloader');
const { allowAdminAndNonAdmin, allowAdminOnly } = require('./libs/auth');

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
const authRouter = require('./routes/authenticate');

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
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 36000 },
}));
app.use(flash());


app.use(function(req, res, next) {
  res.locals.username= req.session.username
  res.locals.admin = req.session.admin;
  next();
});


/* Register routes */
app.use('/auth', authRouter);
app.use('/agent-dashboard', allowAdminAndNonAdmin, agentDashboardRouter);
app.use('/', allowAdminOnly, homeRouter);
app.use('/campaigns',allowAdminOnly, campaignsRouter);
app.use('/create-campaign',allowAdminOnly, createCampaignRouter);
app.use('/edit-campaign', allowAdminOnly,editCampaignRouter);
app.use('/agent-provision', allowAdminOnly,agentProvision);
app.use('/agent-distribution', allowAdminOnly, agentDistribution);
app.use('/inbound-number-provision', allowAdminOnly, inboundNumberProvision);
app.use('/fault', fault);
// reports and dashboards
app.use('/campaign-dashboard', allowAdminOnly, campaignDashboardRouter);
app.use('/agent-wise-report', allowAdminOnly, agentWiseReportRouter);
app.use('/campaign-wise-report', allowAdminOnly, campaignWiseReportRouter);


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
