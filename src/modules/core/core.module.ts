import { Module } from '@nestjs/common';
import { SharedModule } from 'src/modules/shared/shared.module';

@Module({
  providers: [],
  imports : [SharedModule],
  exports : []
})
export class CoreModule {}
