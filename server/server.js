import dotenv from "dotenv";
import http from "http";
import app from "./src/app/app.js";
dotenv.config({quiet:true});


const PORT = process.env.PORT || 3000;

//using cors for cross origin resource sharing
import cors from "cors";    

app.use(cors());


const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});







