import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";


export class CreateRoleDto {
    @IsNotEmpty({ message: 'Name k duoc de trong' })
    name: string;

    @IsNotEmpty({ message: 'description k duoc de trong' })
    description: string;

    @IsBoolean({ message: 'isActive có giá trị boolean' })
    @IsNotEmpty({ message: 'isActive k duoc de trong' })
    isActive: boolean;

    @IsMongoId({ each: true, message: 'each permisstion là mong ObjectId' })
    @IsArray({ message: 'permisstions có định dạng là array' })
    @IsNotEmpty({ message: 'permisstions k duoc de trong' })
    permisstions: mongoose.Schema.Types.ObjectId[];

}


