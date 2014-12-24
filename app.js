var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//Session:
var session = require('express-session');
var multer = require('multer');
//Connect database:
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/GanXa');
//Routes
var controllers = require('./routes/controllers');
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'ganxa', resave: true, saveUninitialized: true, maxAge: new Date(Date.now() + 3600000), expires: new Date(Date.now() + 3600000)}));
app.use(multer({dest: './public/images/'}));

//rewrite
app.use(function (req, res, next) {
    var url = req.url;
    if (req.url.substr(-1) == '/' && req.url.length > 1) {
        console.log("vào");
        res.redirect(301, req.url.slice(0, -1));
    }
    if (req.url === '/diadiem') {
        req.url = '/location';
    }
    if (req.url === '/timkiem') {
        req.url = '/search';
    }
    if (req.url === '/trangchu') {
        req.url = '/';
    }
    /*if (url.match("^/store/")) {
        console.log("chuẩn");
        req.url = "/store_detail?id=5491423870c4abcc12516ad0";
    }*/
    next();
});

app.use('/', controllers);

// catch 404 and forward to error handler
//đây
app.use(function (req, res, next) {
    //res.render('404', { url: req.url });
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    /*res.get('/index');*/
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;