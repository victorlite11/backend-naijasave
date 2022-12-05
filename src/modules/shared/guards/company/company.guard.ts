import { CanActivate, ExecutionContext, Request, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AdminDto } from 'src/modules/shared/dto/admin/admin-dto';
import { DbMediatorService } from 'src/modules/shared/services/db-mediator/db-mediator.service';

/***
 * Only HeadAdmin should be given access
 */
@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(
    private dbMediator: DbMediatorService
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return this.validate(context.switchToHttp().getRequest().user.userId);
  }

  async validate(userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const admin = await this.dbMediator.fetchOne <AdminDto> ({_id: userId}, {collection: "admins", db: "naijasave"})
    if (admin && admin.identity.isHeadAdmin) {
      return true;
    } else {
      return false;
    }
  }
}
