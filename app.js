/* Dependencies */
const createError = require('http-errors');
const dotenv = require('dotenv')
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

/* Import routes */
const campaignsRouter = require('./routes/campaigns');
const createCampaignRouter = require('./routes/createcampaign');
const agentsRouter = require('./routes/agents');
const dashboardRouter = require('./routes/dashboard');
const customReportRouter = require('./routes/customreport');

/* Set app */
dotenv.config()
const app = express();
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
