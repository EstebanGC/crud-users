import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import { InjectRepository } from '@nestjs/typeorm';

import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Contact } from 'src/contacts/entities/contact.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class UsersService {

  private readonly logger = new Logger('UserService');
  
  constructor(

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly jwtService: JwtService, 
    ){}
    

  async create(createUserDto: CreateUserDto) {

    try {

      const  { contacts = [], password, ...userDetails} = createUserDto;

      const user = this.userRepository.create({
        ...userDetails,
        password: bcrypt.hashSync(password,10),
        contacts: contacts.map(contact=> this.contactRepository.create(contact))
      });
      
      await this.userRepository.save(user);

      return {
        ...user,
        token: this.getJwtToken({id: user.id})
      };

    } catch(error) {
      this.handleExceptions(error);
    }
  }

  //ToDo: page  ------- Code refactoryzed
  async findAll(paginationDto:PaginationDto) {

    const { limit=10, offset= 0 } = paginationDto;

    const users = await this.userRepository.find({
      take: limit,
      skip: offset,
      relations: {
        contacts:true,
      },
    });
    //newcode
    return users.map((user) => ({
      ...user,
      contacts: user.contacts.map((contact) => contact),
    }));
  }

  async findOne(id: string) {

    const user = await this.userRepository.findOneBy({id});

    if(!user) 
      throw new NotFoundException(`User with id ${id} not found`)
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id:id,
      ...updateUserDto,
      contacts: [],
    });

    if(!user) throw new NotFoundException(`User with id ${id} not found!`);
    
    try {
      await this.userRepository.save(user);
    } catch(error){
      this.handleExceptions(error);
    }
    return user;
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async login(loginDto:LoginDto) {
    const {user, password} = loginDto;
    const userLogin = await this.userRepository.findOne({
      where: {user},
      select: { user: true, password: true, id: true}
    });

    if(!userLogin)
      throw new UnauthorizedException('{user} is not valid');

    if(bcrypt.compareSync(password, userLogin.password))
      throw new UnauthorizedException('{password} is not valid');

    return {
      ...userLogin,
      token: this.getJwtToken({id: userLogin.id})
    };
  }

  private getJwtToken(payload: JwtPayload) {

    const token = this.jwtService.sign(payload);
    return token;

  }

  private handleExceptions(error:any) {
    if(error.code === '23505')
        throw new BadRequestException(error.detail);
      this.logger.error(error)
      throw new InternalServerErrorException('Something is going wrong!')
  }
}
