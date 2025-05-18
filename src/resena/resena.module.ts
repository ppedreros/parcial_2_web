import { Module } from '@nestjs/common';
import { ResenaService } from './resena.service';
import { ResenaController } from './resena.controller';
import { ResenaEntity } from './resena.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudianteModule } from 'src/estudiante/estudiante.module';
import { EstudianteEntity } from 'src/estudiante/estudiante.entity';
import { ActividadEntity } from 'src/actividad/actividad.entity';

@Module({
  providers: [ResenaService],
  imports: [TypeOrmModule.forFeature([ResenaEntity, EstudianteEntity, ActividadEntity])],
  controllers: [ResenaController]
})
export class ResenaModule {}
