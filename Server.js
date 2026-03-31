const express = require("express");
const cors = require("cors");
require("dotenv").config();

const dbconnect = require("./Config/dbconnect");
// const authRouter = require("./Routes/authRoute");


const authRoute = require("./Routes/authRoute");
const Workoutroute = require("./Routes/Workoutroute");
const Nutritionroute = require("./Routes/NutritionRoute");
const ProgressRoute = require("./Routes/ProgressRoute");
// const WorkRouter = require("./Routes/authRoute");

const app = express();

// 🔹 Middleware
app.use(express.json());
app.use(cors());

// 🔹 Database connection
dbconnect();

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("Fitness Server is running ✅");
});
app.use("/User", authRoute);
app.use("/workouts",Workoutroute );

app.use("/Nutrition",Nutritionroute );


app.use("/Progress",ProgressRoute);

// 🔹 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 🔹 Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} 🚀`);
});