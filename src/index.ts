import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectdb from "./db";

const app = express();

const PORT = process.env.PORT || 3000;

connectdb().then(()=>{
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
}

).catch((err)=>{
  console.log("Mongoose connection failed", err)
})
app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
