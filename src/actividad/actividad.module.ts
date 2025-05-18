import { Module } from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { ActividadController } from './actividad.controller';
import { ActividadEntity } from './actividad.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [ActividadService],
  imports: [TypeOrmModule.forFeature([ActividadEntity])],  
  controllers: [ActividadController]
})
export class ActividadModule {}
