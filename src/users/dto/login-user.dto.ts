import { IsArray, IsOptional, IsString, MaxLength } from "class-validator";
import { Contact } from "src/contacts/entities/contact.entity";


export class LoginDto {
    @IsString()
    @MaxLength(80)
    user: string;

    @IsString()
    @MaxLength(80)
    password: string;

    @IsArray()
    @IsOptional()
    contacts: Contact[];
}
