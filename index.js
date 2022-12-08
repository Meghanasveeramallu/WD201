const app = require("./app");

// eslint-disable-next-line no-undef
app.listen(process.env.PORT || 8000, () => {
  console.log("Started express server at port 8000");
});
