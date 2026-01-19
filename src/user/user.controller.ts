import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from 'src/auth/schema/user.schema';
import { Roles } from 'src/common/decorators/roles.decorators';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/common/guards/jwt_auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {

    constructor(private readonly userServices: UserService) { }
    @Post("add/newTL/:id")
    @Roles(UserRole.OWNER)
    addNewTL(@Param("id") id: string) {
        return this.userServices.add_TEAM_LEAD(id)
    }


    @Get(":id")
    getUserDetails(@Param("id") id:string){
        return this.userServices.getProfile(id)
    }

    @Post("assign-TL")
    @Roles(UserRole.OWNER)
    assignTl(@Body() data:{empId:string,tlId:string}){
        return this.userServices.assignTL(data.empId,data.tlId)
    }
}
