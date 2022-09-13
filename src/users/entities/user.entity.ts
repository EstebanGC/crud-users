import { Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import { Contact } from 'src/contacts/entities/contact.entity';

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', {
        length:80,
        unique:true,
    })
    user:string;

    @Column('varchar', { length: 80 })
    password: string;

    @OneToMany(
        () => Contact,
        (contact) => contact.user,
        {
            cascade:true,
            eager:true
        }
    )
    contacts:Contact[];
}
