import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public, ResponseMessage, User } from "src/decorator/customize";
import { LocalAuthGuard } from "./local-auth.guard";
import { RegisterUserDto } from "src/users/dto/create-user.dto";
import { Request, Response } from "express";
import { IUser } from "src/users/user.interface";
import { use } from "passport";


@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }
    @Public()
    @UseGuards(LocalAuthGuard)
    @ResponseMessage('User Login')
    @Post('/login')
    handleLogin(@Req() req,
        @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
    }

    @Public()
    @ResponseMessage('Register a new user')
    @Post('register')
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto)
    }

    @ResponseMessage('Get User Information')
    @Get('/account')
    handleGetAccount(@User() user: IUser) {
        return { user };
    }

    @Public()
    @ResponseMessage('Get User by refresh token')
    @Get('/refresh')
    handleRefreshToken(@Req() req: Request,
        @Res({ passthrough: true }) response: Response) {
        const refreshToken = req.cookies['refresh_token'];
        return this.authService.processNewToken(refreshToken, response);
    }

    @ResponseMessage('Logout User')
    @Post('/logout')
    handleLogout(@Res({ passthrough: true }) response: Response,
        @User() user: IUser) {
        return this.authService.logout(response, user)
    }



}


