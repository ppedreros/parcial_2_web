import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudianteEntity } from '../../estudiante/estudiante.entity';
import { ActividadEntity } from '../../actividad/actividad.entity';
import { ResenaEntity } from '../../resena/resena.entity';

export const TypeOrmTestingConfig = () => [
 TypeOrmModule.forRoot({
   type: 'sqlite',
   database: ':memory:',
   dropSchema: true,
   entities: [EstudianteEntity, ActividadEntity, ResenaEntity],
   synchronize: true
 }),
 TypeOrmModule.forFeature([EstudianteEntity, ActividadEntity, ResenaEntity]),
];