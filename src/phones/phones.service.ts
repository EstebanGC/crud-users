import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException,Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreatePhoneDto } from './dto/create-phone.dto';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { Phone } from './entities/phone.entity';

@Injectable()
export class PhonesService {

  private readonly logger = new Logger('PhoneService');

  constructor(
    @InjectRepository(Phone)
    private readonly phoneRepository: Repository<Phone>,
  ){}

  async create(createPhoneDto: CreatePhoneDto) {
    try{
      const phone = this.phoneRepository.create(createPhoneDto);
      await this.phoneRepository.save(phone);
      return phone;
    }catch(error){
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto:PaginationDto) {

    const { limit=10, offset= 0 } = paginationDto;

    return this.phoneRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const phone = await this.phoneRepository.findOneBy({ id });
    if (!phone) throw new NotFoundException(`Phone with id ${id} not found`);
    return phone;
  }

  // return phone added
  async update(id: string, updatePhoneDto: UpdatePhoneDto) {
    const phone = await this.phoneRepository.preload({
      id: id,
      ...updatePhoneDto,
    });
    if(!phone)
    throw new NotFoundException(`Phone with ${id} not found`);
    try {
      await this.phoneRepository.save(phone);
    }catch(error){
      this.handleExceptions(error);
    }
    return phone;
  }

  async remove(id: string) {
    const phone = await this.phoneRepository.findOneBy({id});
    await this.phoneRepository.remove(phone);
  }

  private handleExceptions(error:any) {
    if(error.code === '23505')
        throw new BadRequestException(error.detail);
      this.logger.error(error)
      throw new InternalServerErrorException('Something is going wrong!')
  }
}
