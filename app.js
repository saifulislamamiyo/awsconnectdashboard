/* Dependencies */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('express-flash');

/* Import routes */
const campaignsRouter = require('./routes/campaigns');
const createCampaignRouter = require('./routes/createcampaign');
const agentsRouter = require('./routes/agents');
const dashboardRouter = require('./routes/dashboard');
const customReportRouter = require('./routes/customreport');

/* Set app */
const app = express();
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('Todo: Load from env config'));
app.use(session({
  secret: 'Todo: Load from env config',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

/* Register routes */
app.use('/', campaignsRouter);
app.use('/create-campaign', createCampaignRouter);
app.use('/agents', agentsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/custom-report', customReportRouter);

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
