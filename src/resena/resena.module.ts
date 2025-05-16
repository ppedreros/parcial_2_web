import { Module } from '@nestjs/common';
import { ResenaService } from './resena.service';

@Module({
  providers: [ResenaService]
})
export class ResenaModule {}
