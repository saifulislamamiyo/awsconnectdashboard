/* Dependencies */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const flash = require('express-flash');

/* Import routes */
const campaignsRouter = require('./routes/campaigns');
const homeRouter = require('./routes/home');
const createCampaignRouter = require('./routes/createcampaign');
const agentDistribution = require('./routes/agentdistribution');
const dashboardRouter = require('./routes/dashboard');
const customReportRouter = require('./routes/customreport');
const agentProvision = require('./routes/agentprovision');

/* Set app */
const app = express();
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'Todo: Load from env config',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly:true,  maxAge: 1000 * 36000 },
}));
app.use(flash());

/* Register routes */
app.use('/', homeRouter);
app.use('/campaigns', campaignsRouter);
app.use('/create-campaign', createCampaignRouter);
app.use('/agent-dashboard', customReportRouter);
app.use('/campaign-dashboard', dashboardRouter);
app.use('/agent-distribution', agentDistribution);
app.use('/agent-provision', agentProvision);


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
