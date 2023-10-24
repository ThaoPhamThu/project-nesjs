import { IsNotEmpty } from "class-validator";


export class CreatePermissionDto {
    @IsNotEmpty({ message: 'Name k duoc de trong' })
    name: string;

    @IsNotEmpty({ message: 'apiPath k duoc de trong' })
    apiPath: string;

    @IsNotEmpty({ message: 'Module k duoc de trong' })
    module: string;

    @IsNotEmpty({ message: 'Method k duoc de trong' })
    method: string;

}

