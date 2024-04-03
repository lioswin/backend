import { auth } from "express-oauth2-jwt-bearer";
import {Request ,Response,NextFunction} from "express";
import jwt from "jsonwebtoken";
import User from "../modals/User";

declare global {
  namespace Express{
    interface Request{
      userId:String;
      auth0Id:String;
    }
  }
}

export const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: 'RS256'
  });

  /**
   * Middleware function to parse and verify JWT token from the request headers.
   * If the token is valid, it sets the authenticated user's auth0Id and userId in the request object and calls the next middleware.
   * If the token is invalid or missing, it sends a 401 Unauthorized response.
   * 
   * @param req - The Express Request object.
   * @param res - The Express Response object.
   * @param next - The Express NextFunction.
   */
  export const jwtParse = async (
    req:Request ,
    res:Response,
    next:NextFunction
    )=>{

      const {authorization} = req.headers;
      if(!authorization || !authorization.startsWith("Bearer ")){
        return res.sendStatus(401);
      }

      const token = authorization.split(" ")[1];

      try{

        const decoded = jwt.decode(token) as jwt.JwtPayload;
        const auth0Id = decoded.sub;

        const user = await User.findOne({auth0Id})
        if(!user){
          return res.sendStatus(401);
        }
        req.auth0Id  = auth0Id as String;
        req.userId = user._id.toString();
        next();
      }catch(error){
        return res.sendStatus(401);
      }
  }