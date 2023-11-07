import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';
import { async } from 'rxjs';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @ResponseMessage('Create a new job')
  @Post()
  async create(@Body() createJobDto: CreateJobDto, @User() user: IUser) {
    let newJob = await this.jobsService.create(createJobDto, user);
    return {
      _id: newJob?._id,
      createdAt: newJob?.createdAt
    };
  }

  @Public()
  @ResponseMessage('Fetch jobs with pagination')
  @Get()
  async findAll(@Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser) {
    return await this.jobsService.findAll(+currentPage, +limit, qs, user);
  }

  @Public()
  @ResponseMessage('Fetch a job by id')
  @Get(':id')
  findOne(@Param('id') id: string,
    @User() user: IUser) {
    return this.jobsService.findOne(id, user);
  }

  @ResponseMessage('Update a job')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto,
    @User() user: IUser) {
    let newJob = await this.jobsService.update(id, updateJobDto, user);
    return newJob;
  }

  @ResponseMessage('Delete a job')
  @Delete(':id')
  remove(@Param('id') id: string,
    @User() user: IUser) {
    return this.jobsService.remove(id, user);
  }
}
