import { Transform, Type } from "class-transformer";
import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator";
import mongoose from "mongoose";


export class CreateSubscriberDto {
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @IsArray()
    @IsString({ each: true, message: 'Skill định dạng là string' })
    @IsNotEmpty({ message: 'Skills không được để trống' })
    skills: string[];

    @IsNotEmpty({ message: 'Name không được để trống' })
    name: string;
}
