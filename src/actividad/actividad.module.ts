import { Module } from '@nestjs/common';
import { ActividadService } from './actividad.service';

@Module({
  providers: [ActividadService]
})
export class ActividadModule {}
