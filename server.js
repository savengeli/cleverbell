const mongodb = require("mongodb").MongoClient;
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo")(expressSession);
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

// Database:
/* To use in localhost:
const dbAddress = "localhost:27017";
const database = "cleverdb";
`mongodb://${userPwd}@${dbAddress}/${database}`;
*/
const userPwd = `${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}`;
const dbUrl =
`mongodb://${userPwd}@cluster0-shard-00-00-kqwdc.mongodb.net:27017,cluster0-shard-00-01-kqwdc.mongodb.net:27017,cluster0-shard-00-02-kqwdc.mongodb.net:27017/cleverdb?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true`;    

app.use("/", express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressSession({
    name: "cookie",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    secret: "aSecretString",
    cookie: {
        secure: false,
        sameSite: true,
    },
    store: new MongoStore({ url: dbUrl })
}));

const connectToDatabase = () => {
    mongoose.set('useCreateIndex', true); // removes mongoose deprecationWarning
    mongoose.connect(dbUrl, { useNewUrlParser: true });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        console.log("we are connected!")
    });
}

connectToDatabase();

// ----------- ROUTES: ------------
app.use("/", require("./routes/index.js"));
app.use("/home", require("./routes/home.js"));
app.use("/addactivity", require("./routes/addactivity.js"));
app.use("/editactivity", require("./routes/editactivity.js"));

app.listen(PORT, () => {
    console.log(`Listening to ${PORT}`)
});
