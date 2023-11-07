import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './user.interface';
import { async } from 'rxjs';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ResponseMessage('Create a new User')
  async create(
    @Body() createUserDto: CreateUserDto, @User() user: IUser
  ) {
    let newUser = await this.usersService.create(createUserDto, user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    };
  }

  @Get()
  @ResponseMessage('Fetch users with paginate')
  async findAll(@Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser) {
    return await this.usersService.findAll(+currentPage, +limit, qs, user);
  }

  @Public()
  @ResponseMessage('Fetch user by id')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch()
  @ResponseMessage('Update a User')
  async update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    let updateUser = await this.usersService.update(updateUserDto, user)
    return updateUser;
  }

  @Delete(':id')
  @ResponseMessage('Delete a User')
  async remove(@Param('id') id: string, @User() user: IUser) {
    return await this.usersService.remove(id, user);
  }
}
