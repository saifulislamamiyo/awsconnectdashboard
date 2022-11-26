/* Dependencies */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const flash = require('express-flash');
const compression = require('express-compression');
const minifyHTML = require('express-minify-html-2');

const { pageCompress } = require('./libs/configloader');

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
  //===========================
  app.use(compression());
  //===========================
} // end if page compress





// ======================
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// TODO: Session secret
app.use(session({
  secret: 'Todo: Load from env config',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 36000 },
}));
app.use(flash());

/* Register routes */
app.use('/', homeRouter);
app.use('/campaigns', campaignsRouter);
app.use('/create-campaign', createCampaignRouter);
app.use('/edit-campaign', editCampaignRouter);
app.use('/agent-provision', agentProvision);
app.use('/agent-distribution', agentDistribution);
app.use('/inbound-number-provision', inboundNumberProvision);
app.use('/fault', fault);
// TODO: reports and dashboards
app.use('/agent-dashboard', agentDashboardRouter);
app.use('/campaign-dashboard', campaignDashboardRouter);


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
