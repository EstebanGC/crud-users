import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Phone } from 'src/phones/entities/phone.entity';
import { PhonesService } from 'src/phones/phones.service';
import { User } from 'src/users/entities/user.entity';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService],
  imports: [TypeOrmModule.forFeature([Contact, Phone, User])],
})

export class ContactsModule {}
