import { Injectable } from '@nestjs/common';
import { ContributorDto } from 'src/modules/core/dtos/contributor/contributor';
import { AdminDto } from 'src/modules/shared/dto/admin/admin-dto';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';

@Injectable()
export class GeneralService {
    fakePassword <T extends AdminDto | ContributorDto> (entity ?: T) : T {
        if (entity) {
          entity.credentials.password = IdGenerator.generateAuthToken(6)  
        }
        return entity;
    }
}
