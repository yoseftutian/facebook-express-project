import express from'express'
import Products from "./products.mjs";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express()
const port = 3001


app.use(json());
app.use(cors());

app.use("/products", Products);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(err.message);
  });
  
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})