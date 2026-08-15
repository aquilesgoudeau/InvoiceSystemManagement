import "./services/db.js"
import express from "express"
import { ScanRoutes } from "./routes/scanRoutes.js"
import { ReportsRoutes } from "./routes/reportsRoutes.js"
import { AuthRoutes } from "./routes/authRoutes.js"
import { protectedKeys } from "./config/keys.js"



const app = express()
app.use(express.json());

AuthRoutes(app)
ScanRoutes(app)
ReportsRoutes(app)

const PORT = protectedKeys.port || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, ()=>{
      console.log(`server running in port: ${PORT}`);
  });
}

export default app;

