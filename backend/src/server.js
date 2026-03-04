const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors({
  origin: "https://www.studymeta.in",
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/health",(req,res)=>{
  res.json({status:"ok"});
});

const PORT = process.env.PORT || 8080;

app.listen(PORT,()=>{
  console.log("Server running on",PORT);
});
