require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var db = require('./config/connection')
const Handlebars = require("handlebars");





var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var session = require('express-session');
const { handlebars } = require('hbs');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/' }))



app.use(session({ secret: "Private", resave: true, saveUninitialized: true, cookie: { maxAge: 60000000 } }))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



Handlebars.registerHelper('for', function (from, to, incr, block) {
  var accum = '';
  for (var i = from; i < to; i += incr)
    accum += block.fn(i);
  return accum;
})
Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

Handlebars.registerHelper('incremented', function (index) {
  ++index;
  return index;
});

Handlebars.registerHelper('multyply', (value1, value2) => {
  return (parseInt(value1 * value2))
}

)

Handlebars.registerHelper('isDelivered', (value) => {
  return value == 'Delivered' ? true : false
})
Handlebars.registerHelper('isCanceled', (value) => {
  return value == 'canceled' ? true : false
})
Handlebars.registerHelper('isOrderConfirmed', (value) => {
  return value == 'Dispatched' ? true : false
})
Handlebars.registerHelper('isShipped', (value) => {
  return value == 'Shipped' ? true : false
})
Handlebars.registerHelper('isOutForDelivary', (value) => {
  return value == 'OutForDelivery' ? true : false
})
Handlebars.registerHelper('isReturnRequsted', (value) => {
  return value == 'ReturnAproved' ? true : false
})


db.connect((err) => {
  if (err)
    console.log('connection Error' + err);
  else
    console.log(`Data base connected`);
})


app.use('/', userRouter);
app.use('/admin', adminRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
