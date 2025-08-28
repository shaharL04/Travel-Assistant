import cors from 'cors';

// basic middleware check
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
};

const corsMiddleware = cors(corsOptions);
export default corsMiddleware
