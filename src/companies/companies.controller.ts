import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';
import mongoose from 'mongoose';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  @ResponseMessage('Create a new company')
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto, @User() user: IUser) {
    return this.companiesService.create(createCompanyDto, user);
  }

  @Public()
  @Get()
  @ResponseMessage('Fetch List Company with paginate')
  findAll(@Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string) {
    return this.companiesService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string,) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return 'Not find job';

    return this.companiesService.findOne(id);
  }

  @ResponseMessage('Update a company')
  @Patch(':id')
  update(@Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @User() user: IUser) {
    return this.companiesService.update(id, updateCompanyDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string,
    @User() user: IUser) {
    return this.companiesService.remove(id, user);
  }
}
