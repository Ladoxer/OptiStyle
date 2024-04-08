const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const app = express();
const dbConnect = require('./config/dbConnect');
dbConnect();
const userRoute = require("./routes/userRoute");
const adminRoute = require('./routes/adminRoute');
const errorHandlers = require('./middleware/errorHandler');

const job = require('./config/job');



// to middleware
app.use((req, res, next) => {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set('view engine','ejs');

// for user routes
app.use("/", userRoute);

// for admin routes
app.use('/admin',adminRoute);

// for error 
app.use(errorHandlers.error404);
// app.use(errorHandlers.error500);
// app.use(errorHandlers.error502);


app.listen(process.env.PORT, () => {
  console.log("Running....");
});
