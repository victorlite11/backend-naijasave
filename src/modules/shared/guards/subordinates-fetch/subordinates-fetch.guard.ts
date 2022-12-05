import { CanActivate, ExecutionContext, Request, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AdminDto } from 'src/modules/shared/dto/admin/admin-dto';
import { ContributorDto } from 'src/modules/shared/dto/contributor/contributor-dto';
import { DbMediatorService } from 'src/modules/shared/services/db-mediator/db-mediator.service';

/***
 * Only admins, super contributors and sub contributors should be given access
 */
@Injectable()
export class SubordinatesFetchGuard implements CanActivate {
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
    if (admin) {
      return true;
    } else {
      // fetch from contributors collection [maybe user is a contributor]
      const contributor = await this.dbMediator.fetchOne <ContributorDto> ({_id: userId}, {collection: "contributors", db: "naijasave"})

      if (contributor && (contributor.identity.isSuperContributor || contributor.identity.isSubContributor)) {
        return true;
      } else {
        return false;
      }
    }
  }
}
