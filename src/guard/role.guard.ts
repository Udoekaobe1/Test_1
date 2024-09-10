import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ForbiddenRoleException } from "src/exception/role.exception";
import { UserService } from "../user/user.service";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor (private reflector:Reflector, private userService:UserService){}
// a service that allows access to metadata attached to route handlers (such as the roles attached to access a route)
    async canActivate(context: ExecutionContext):Promise<boolean>{
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    // the roles variable retrieves the roles metadata attached to the routes handler (the function that will handle the requests)
    // console.log('roles',roles)

    const request = context.switchToHttp().getRequest();
    // the request object represents the incoming HTTP requests. it contains information like headers, the current user, and other requests related data
    if(request?.user){
        const headers:Headers=request.headers;
        let user = this.userService.user(headers);
        // the code fetches the requests headers and calls the userService.user(headers) method to retrieve the current user's dteails, such as their roles.

        if (!roles.includes((await user).role)){
            throw new ForbiddenRoleException(roles.join(' or '));
        }
        return true;
        // this line checks if the user's role (retrieved from the userservice) iis included in the lists of roles allowed to access this route
    }
    return false;
    // if the user's role is not in the list,it throws a ForbiddenRoleException, effectively denying access to the route
    }
}