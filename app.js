/* Dependencies */
var createError = require('http-errors');
var dotenv = require('dotenv')
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

/* Import routes */
var campaignsRouter = require('./routes/campaigns');
var createCampaignRouter = require('./routes/createcampaign');
var agentsRouter = require('./routes/agents');
var dashboardRouter = require('./routes/dashboard');
var customReportRouter = require('./routes/customreport');

/* Set app */
dotenv.config()
var app = express();
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Register routes */
app.use('/', campaignsRouter);
app.use('/create-campaign', createCampaignRouter);
app.use('/agents', agentsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/custom-report', customReportRouter);

/* Catch 404 and forward to error handler */
app.use(function(req, res, next) {
  next(createError(404));
});

/* Error handler */
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
