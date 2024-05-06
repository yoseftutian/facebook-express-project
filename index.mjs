import express from'express'
const app = express()
const port = 3001




app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(err.message);
  });
  
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})