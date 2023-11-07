import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeCvDto, CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) { }

  @ResponseMessage('Create a new resume')
  @Post()
  async create(@Body() createResumeCvDto: CreateResumeCvDto, @User() user: IUser) {
    let newResume = await this.resumesService.create(createResumeCvDto, user);
    return {
      _id: newResume?._id,
      createdAt: newResume?.createdAt
    }
  }

  @ResponseMessage('Get Resumes by User')
  @Post('by-user')
  getResumesByUser(@User() user: IUser) {
    return this.resumesService.findByUsers(user);
  }


  @ResponseMessage('Fetch all resumes with paginate')
  @Get()
  async findAll(@Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string) {
    return await this.resumesService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage('Fetch a resume by id')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.resumesService.findOne(id);
  }

  @ResponseMessage('Update status resumes')
  @Patch(':id')
  async update(@Param('id') id: string, @Body('status') status: string, @User() user: IUser) {
    return await this.resumesService.update(id, status, user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @User() user: IUser) {
    return await this.resumesService.remove(id, user);
  }
}
