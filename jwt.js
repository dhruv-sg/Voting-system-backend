// const jwt = require('jsonwebtoken')

// const jwtAuthMiddleware =(req,res,next)=>{
    
//     //first check request headers has authorization or not
//     const authorization = req.headers.authorization
//     if(!authorization) return res.status(401).json({error: 'token not found'});

//     //extract jwt tocken from the request header
//     const token = req.headers.authorization.split(' ')[1];
//     if(!token) return res.status(401).json({error: 'unauthorized'});

//     try{
//         //verify the jwt token
//         const decoded = jwt.verify(token,process.env.JWT_SECRET);

//         //attack user info
//         req.user = decoded
//         next();
//     }catch(err){
//         console.log(err);
//         res.status(401).json({error:'invalid token'})
//     }
// }

// //function to generate token

// const generateToken = (userData) => {
//     //generate a new JWT token using user data
//     return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn:30000})
// }

// module.exports = {jwtAuthMiddleware,generateToken}

const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header is present
  if (!authHeader) {
    return res.status(401).json({ error: 'Token not found' });
  }

  // Extract the token from the header
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token missing' });
  }

  try {
    // Verify the token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to the request
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Generate JWT token
const generateToken = (userData) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: '1h', // Set token to expire in 1 hour
  });
};

module.exports = { jwtAuthMiddleware, generateToken };
