import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Strategy, ExtractJwt } from "passport-jwt";
import { User } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";
import { PassportStrategy } from "@nestjs/passport";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
  signAsync(UserPayLoad: { id: string; email: string; }) {
    throw new Error('Method not implemented.');
  }
  verify(token: any) {
    throw new Error('Method not implemented.');
  }
    constructor(private readonly userService:UserService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWTSECRET,
        });
    }
        async validate(payload: {email}): Promise<User>{
        const {email} = payload;
        const user = await this.userService.findEmail(email)
        if(!user){
            throw new UnauthorizedException('Login first to access this endpoint')
        }
        return user;
    }
}