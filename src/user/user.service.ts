import { Injectable } from '@nestjs/common';
import { UserRepository } from './repo/user.repo';

@Injectable()
export class UserService {
    constructor(private readonly userepo:UserRepository){}

    async add_TEAM_LEAD(id:string){
        const user = await this.userepo.getUserById(id)
        return this.userepo.addNewTL(user._id)
    }

    async getProfile(id:string){
        return this.userepo.getUserById(id)
    }

    async assignTL(empId:string,tlId:string){
        return await this.userepo.assignTL(empId,tlId)
    }
}
