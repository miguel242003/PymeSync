const app = require("./app");
const env = require("./config/env");

app.listen(env.port, () => {
  console.log(`PymeSync backend escuchando en http://localhost:${env.port}`);
});
