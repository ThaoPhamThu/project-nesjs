import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permisstion, PermisstionSchema } from './schemas/permission.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
  imports: [MongooseModule.forFeature([{ name: Permisstion.name, schema: PermisstionSchema }])],
})
export class PermissionsModule { }
