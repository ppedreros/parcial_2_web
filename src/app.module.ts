import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EstudianteModule } from './estudiante/estudiante.module';
import { ActividadEntity } from './actividad/actividad.entity';
import { ResenaEntity } from './resena/resena.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadModule } from './actividad/actividad.module';
import { ResenaModule } from './resena/resena.module';
import { EstudianteEntity } from './estudiante/estudiante.entity';

@Module({
  imports: [EstudianteModule, ActividadModule, ResenaModule, 
    TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'university',
    entities: [EstudianteEntity, ActividadEntity, ResenaEntity],
    dropSchema: true,
    synchronize: true
    }),
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
