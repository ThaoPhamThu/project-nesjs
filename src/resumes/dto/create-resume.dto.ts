import { Type } from "class-transformer";
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from "class-validator";
import mongoose from "mongoose";

export class CreateResumeDto {
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @IsNotEmpty({ message: 'useId không được để trống' })
    useId: string;

    @IsNotEmpty({ message: 'url không được để trống' })
    url: number;

    @IsNotEmpty({ message: 'status không được để trống' })
    status: string;

    @IsNotEmpty({ message: 'companyId không được để trống' })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'jobId không được để trống' })
    jobId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'History không được để trống' })
    histoty: mongoose.Schema.Types.Array;

}

export class CreateResumeCvDto {

    @IsNotEmpty({ message: 'url không được để trống' })
    url: string;

    @IsMongoId({ message: 'companyId is a mongo id' })
    @IsNotEmpty({ message: 'companyId không được để trống' })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsMongoId({ message: 'jobId is a mongo id' })
    @IsNotEmpty({ message: 'jobId không được để trống' })
    jobId: mongoose.Schema.Types.ObjectId;

}

