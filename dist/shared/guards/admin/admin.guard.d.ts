import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DbMediatorService } from 'src/shared/services/db-mediator/db-mediator.service';
export declare class AdminGuard implements CanActivate {
    private dbMediator;
    constructor(dbMediator: DbMediatorService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    validate(userId: string): Promise<boolean>;
}
