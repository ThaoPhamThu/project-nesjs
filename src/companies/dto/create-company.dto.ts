import { IsNotEmpty } from "class-validator";


export class CreateCompanyDto {
    @IsNotEmpty({ message: 'Name k duoc de trong' })
    name: string;

    @IsNotEmpty({ message: 'Address k duoc de trong' })
    address: string;

    @IsNotEmpty({ message: 'Description k duoc de trong' })
    description: string;

    @IsNotEmpty({ message: 'Logo k duoc de trong' })
    logo: string;

}

