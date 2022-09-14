import {TypeOrmModule} from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Contact } from 'src/contacts/entities/contact.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';



@Module({
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([User, Contact]),
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory:() => {
        //console.log('JWT SECRET', process.env.JWT_SECRET)
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '2h'
          }
        }
      }
    })
  ],
  // exports: [TypeOrmModule, JwtStrategy, PassportModule]
})
export class UsersModule {}
