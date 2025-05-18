import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { ResenaEntity } from './resena.entity';
import { EstudianteEntity } from '../estudiante/estudiante.entity';
import { ActividadEntity } from '../actividad/actividad.entity';

@Injectable()
export class ResenaService {
   constructor(
       @InjectRepository(ResenaEntity)
       private readonly resenaRepository: Repository<ResenaEntity>,
       
       @InjectRepository(EstudianteEntity)
       private readonly estudianteRepository: Repository<EstudianteEntity>,
       
       @InjectRepository(ActividadEntity)
       private readonly actividadRepository: Repository<ActividadEntity>
   ){}

   async agregarResena(estudianteId: number, actividadId: number, resena: ResenaEntity): Promise<ResenaEntity> {
       const estudiante = await this.estudianteRepository.findOne({
           where: { id: estudianteId },
           relations: ["actividades"]
       });
       
       if (!estudiante) {
           throw new BusinessLogicException(
               "El estudiante con el ID proporcionado no fue encontrado",
               BusinessError.NOT_FOUND
           );
       }
       
       const actividad = await this.actividadRepository.findOne({
           where: { id: actividadId },
           relations: ["inscritos"]
       });
       
       if (!actividad) {
           throw new BusinessLogicException(
               "La actividad con el ID proporcionado no fue encontrada",
               BusinessError.NOT_FOUND
           );
       }
       
       if (actividad.estado !== 2) {
           throw new BusinessLogicException(
               "Solo se pueden agregar reseñas a actividades finalizadas",
               BusinessError.PRECONDITION_FAILED
           );
       }
       
       const estudianteInscrito = actividad.inscritos && 
                                actividad.inscritos.some(est => Number(est.id) === Number(estudianteId));
       
       if (!estudianteInscrito) {
           throw new BusinessLogicException(
               "El estudiante no estuvo inscrito, no puede agregar reseñas",
               BusinessError.PRECONDITION_FAILED
           );
       }
       
       resena.estudiante = estudiante;
       resena.actividad = actividad;
       
       return await this.resenaRepository.save(resena);
   }
}