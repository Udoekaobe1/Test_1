import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../jwt-strategy/jwt.strategy';
import * as dotenv from 'dotenv';
dotenv.config()


@Module({
  imports:[
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: process.env.JWTSECRET,
      signOptions: { expiresIn: '1h' },
    }),
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: true
    })
  ],
  controllers: [UserController],
  providers: [UserService,JwtStrategy],
  exports: [PassportModule, JwtStrategy, UserService]
})
export class UserModule {}
