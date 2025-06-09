require('dotenv').config();
const path = require('node:path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);
const flash = require('connect-flash');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const msgRouter = require('./routes/msgRoutes');


const app = express();


//VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//MIDDLEWARE
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extenden: false }));
app.use(express.json());
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


//GLOBAL MIDDLEWARE FOR USER
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});


//ROUTES
app.use('/', userRouter);
app.use('/', authRouter);
app.use('/', msgRouter);


//START SERVER
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
});


// 404 Error
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handler
app.use((err, req, res, next) => {
    // error in development only
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    if(err.status === 404) {
        res.render('404', { title: 'Page Not Found' });
    } else {
        res.render('500', { title: 'Server Error' });
    }
});