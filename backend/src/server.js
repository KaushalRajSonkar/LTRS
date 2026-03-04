const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const coursesRoutes = require("./routes/courses");

const app = express();

app.use(cors({
  origin: "https://www.studymeta.in",
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);

app.get("/api/health",(req,res)=>{
  res.json({status:"ok"});
});

const PORT = process.env.PORT || 8080;

app.listen(PORT,()=>{
  console.log("Server running on",PORT);
});
