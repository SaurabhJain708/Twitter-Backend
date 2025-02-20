import dotenv from "dotenv";
dotenv.config({
  path:"./.env"
});
import app  from "./app";
import connectdb from "./db";
const PORT = process.env.PORT || 3000;

connectdb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongoose connection failed", err);
  });