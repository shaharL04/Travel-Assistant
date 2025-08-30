import express from "express";
import dotenv from "dotenv";
import corsMiddleware from "./middlewares/corsMiddleware.js";
import router from "./routes/index.js";


dotenv.config();
const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use('/',router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});