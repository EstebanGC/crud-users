import { BadRequestException,Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { Phone } from 'src/phones/entities/phone.entity';

@Injectable()
export class ContactsService {

  private readonly logger = new Logger('ContactService');

  constructor (

    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    
    @InjectRepository(Phone)
    private readonly phoneRepository: Repository<Phone>

    ){}

  async create(createContactDto: CreateContactDto) {
    try {
      const { phones=[], ...contactDetails} = createContactDto;
      const contact = this.contactRepository.create({
        ...contactDetails,
        phones:phones.map(phone => this.phoneRepository.create(phone))
      });
      await this.contactRepository.save(contact);
      return contact;
    }catch(error){
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto:PaginationDto) {

    const { limit=10, offset= 0 } = paginationDto;

    return this.contactRepository.find({
      take: limit,
      skip: offset,
      relations:{
        phones: true,
      },
    });
  }


  async findOne(id: string) {
    const contact = await this.contactRepository.findOneBy({id});
    if(!contact)
      throw new NotFoundException(`Contact with id ${id} not`);
    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    const contact = await this.contactRepository.preload({
      id:id,
      ...updateContactDto,
      phones: [],
    });

    if(!contact) throw new NotFoundException(`Contact with id ${id} not found!`);
    
    try {
      await this.contactRepository.save(contact);
      
    } catch(error){
      this.handleExceptions(error);
    }
    return contact;
  }

  async remove(id: string) {
    const contact = await this.contactRepository.findOneBy({id});
    await this.contactRepository.remove(contact);
  }


  private handleExceptions(error:any) {
    if(error.code === '23505')
        throw new BadRequestException(error.detail);
      this.logger.error(error)
      throw new InternalServerErrorException('Ayuda!')
  }

}
