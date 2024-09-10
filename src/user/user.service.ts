import { HttpException, Injectable, Req, Res, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2'; 
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Request, request, Response } from 'express';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>, private JwtService:JwtService){}
  async create(payload: CreateUserDto) {
    const {email, password, ...rest}=payload;
    const user = await this.userRepo.findOne({where:{email:email}});
    if(user){
      throw new HttpException('sorry user with this email already exists', 400)
    }
    const hashPassword = await argon2.hash(password);

    const userDetails = await this.userRepo.save({
      email,
      password:hashPassword,
      ...rest
    })
    delete userDetails.password;
    const UserPayLoad = { id: userDetails.id, email: userDetails.email};
    return {
      access_token: await this.JwtService.signAsync(UserPayLoad)
    }
  }

  async findEmail(email:string){
    const mail = await this.userRepo.findOneByOrFail({email})
    if(!mail){
      throw new UnauthorizedException()
    }
    return mail;
  }

  async signIn(payload:LoginUserDto, @Req()req:Request, @Res()res:Response){
    const {email, password}=payload;

    const user =await this.userRepo.findOneBy({email})
    // const user = await this.userRepo.createQueryBuilder("user")
    // .addSelect("user.password")
    // .where("user.email = :email", {email:payload}.email).getOne()
    if(!user){
      throw new HttpException('no email found',400)
    }
    const checkedPassword = await this.verifyPassword(user.password, password);
    if(!checkedPassword){
      throw new HttpException('sorry password does not exist', 400)
    }
    const token = await this.JwtService.signAsync({
      email: user.email,
      id: user.id
    });

    res.cookie('isAuthenticated', token,{
      httpOnly: true,
      maxAge: 1 * 60 * 60 *1000 
    })

    return res.send({
      success:true,
      userToken:token
    })
  }

  async logout(@Req()req:Request, @Res()res:Response){
    const clearCookie = res.clearCookie('isAuthenticated')

    const response = res.send(`user successfully logged out`)

    return{
      clearCookie,
      response
    }
  }


  async findAll(email: string) {
    // return this.userRepo.find();
    const user = await this.findEmail(email);
    delete user.password;
    return user;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  } 

  async verifyPassword(
    hashedPassword: string,
    plainPassword: string,
  ): Promise<boolean>{
    try{
      return await argon2.verify(hashedPassword, plainPassword);
    }catch(err){
      return false;
    }
  }

  async user(headers:any) :Promise<any>{
    const authorizationHeader = headers.authorization;
// it tries to extract the authorization header from the incoming request header as the header contains the token for authorization
    if (authorizationHeader){
      const token = authorizationHeader.replace('Bearer ', '');
      const secret = process.env.JWTSECRET;
      // checks if the authorization header exists and if it does not, i skips to the else block and throws an error
    try{
      const decoded = this.JwtService.verify(token);
      let id = decoded["id"];
      // after verifying the token, the function xtracts the user id from the decoded token payload
      let user = await this.userRepo.findOneBy({id});

    return {id:id, name:user.name, email:user.email, role:user.role};
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
    }else{
      throw new UnauthorizedException('Invalid or missing Bearer token');
    }
  }
}
