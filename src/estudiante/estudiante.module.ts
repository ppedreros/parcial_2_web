import { Module } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { EstudianteEntity } from './estudiante.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadModule } from 'src/actividad/actividad.module';
import { ActividadEntity } from 'src/actividad/actividad.entity';

@Module({
  providers: [EstudianteService],
  imports: [TypeOrmModule.forFeature([EstudianteEntity, ActividadEntity])],
  controllers: [EstudianteController]
})
export class EstudianteModule {}
