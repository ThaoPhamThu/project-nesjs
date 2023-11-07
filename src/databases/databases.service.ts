import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { async } from 'rxjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Permission, PermissionDocument } from 'src/permissions/schemas/permission.schema';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from './sample';

@Injectable()
export class DatabasesService implements OnModuleInit {
    private readonly logger = new Logger(DatabasesService.name);

    constructor(
        @InjectModel(User.name)
        private userModel: SoftDeleteModel<UserDocument>,

        @InjectModel(Permission.name)
        private permissionModel: SoftDeleteModel<PermissionDocument>,

        @InjectModel(Role.name)
        private roleModel: SoftDeleteModel<RoleDocument>,

        private configService: ConfigService,

        private userService: UsersService,


    ) { }

    async onModuleInit() {
        const isInit = this.configService.get<string>('SHOULD_INIT');
        if (Boolean(isInit)) {
            const countUser = await this.userModel.count({});
            const countPermission = await this.permissionModel.count({});
            const countRole = await this.roleModel.count({});

            //create permissions
            if (countPermission === 0) {
                await this.permissionModel.insertMany(INIT_PERMISSIONS);
            }

            // create role
            if (countRole === 0) {
                const permissions = await this.permissionModel.find({}).select('_id');
                await this.roleModel.insertMany([
                    {
                        name: ADMIN_ROLE,
                        description: 'Có quyền với tất cả thao tác',
                        isActive: true,
                        permissions: permissions
                    },
                    {
                        name: USER_ROLE,
                        description: 'Người dùng/ứng viên sử dụng hệ thống',
                        isActive: true,
                        permissions: []
                    }
                ])
            }

            //create user
            if (countUser === 0) {
                const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE });
                const userRole = await this.roleModel.findOne({ name: USER_ROLE });
                await this.userModel.insertMany([
                    {
                        name: 'Admin',
                        email: 'admin@gmail.com',
                        password: this.userService.getHashPassword(this.configService.get<string>('INIT_PASSWORD')),
                        age: 30,
                        gender: 'MALE',
                        address: 'Vietnam',
                        role: adminRole?._id
                    },
                    {
                        name: 'Phạm Thu Thảo',
                        email: 'phamthuthao@gmail.com',
                        password: this.userService.getHashPassword(this.configService.get<string>('INIT_PASSWORD')),
                        age: 25,
                        gender: 'FEMALE',
                        address: 'Vietnam',
                        role: adminRole?._id
                    },
                    {
                        name: 'User',
                        email: 'user@gmail.com',
                        password: this.userService.getHashPassword(this.configService.get<string>('INIT_PASSWORD')),
                        age: 20,
                        gender: 'FEMALE',
                        address: 'Vietnam',
                        role: userRole?._id
                    }
                ])
            }

            if (countUser > 0 && countRole > 0 && countPermission > 0) {
                this.logger.log('Already sample data');

            }
        }
    }
}
