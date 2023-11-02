import express from "express";
import bodyParser from "body-parser";
import GenerateCodeRoute from "./src/routes/GenerateCodeRoute.js";
import session from "express-session";
import { auth } from "./src/middlewares/authjwt.js";
import cors from "cors";

const app = express();
const port = 3002;

const allowedOrigins = ["http://localhost:3002/"];
const options = {
    origin: allowedOrigins,
};

app.use(cors(options));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
    session({
        secret: "La_Crêperie_du_Parvis",
        resave: false,
        saveUninitialized: false,
    })
);

app.use("/api", GenerateCodeRoute);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

export default app;
