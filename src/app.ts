import express from "express";
import { errorHandler } from "./middlewares/error.middleware"
import morgan from "morgan";
import routerRoute from "./routes/route.route";
import routerStation from "./routes/station.route";
import routerSearch from "./routes/search.route";
const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use('/route', routerStation)
app.use('/station', routerRoute)
app.use('/search', routerSearch)

app.get("/", (req, res) => {
  res.send("VeTau System API running...");
});

app.use(errorHandler);
export default app;