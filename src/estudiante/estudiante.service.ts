import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstudianteEntity } from './estudiante.entity';
import { ActividadEntity } from '../actividad/actividad.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class EstudianteService {
   constructor(
       @InjectRepository(EstudianteEntity)
       private readonly estudianteRepository: Repository<EstudianteEntity>,
       
       @InjectRepository(ActividadEntity)
       private readonly actividadRepository: Repository<ActividadEntity>
   ){}

   async findEstudianteById(id: number): Promise<EstudianteEntity> {
       const estudiante = await this.estudianteRepository.findOne({
           where: { id }, 
           relations: ["actividades", "resenas"] 
       });

       if (!estudiante)
         throw new BusinessLogicException("El estudiante con el Id proporcionado no fue encontrado", BusinessError.NOT_FOUND);
  
       return estudiante;
   }
  
   async crearEstudiante(estudiante: EstudianteEntity): Promise<EstudianteEntity> {
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(estudiante.correo)) {
           throw new BusinessLogicException("El correo electrónico no es válido", BusinessError.BAD_REQUEST);
       }
       
       if (estudiante.semestre < 1 || estudiante.semestre > 10) {
           throw new BusinessLogicException("El semestre debe estar entre 1 y 10", BusinessError.BAD_REQUEST);
       }
       
       return await this.estudianteRepository.save(estudiante);
   }
   
   async inscribirseActividad(estudianteID: number, actividadID: number): Promise<EstudianteEntity> {
       const estudiante = await this.estudianteRepository.findOne({
           where: { id: estudianteID },
           relations: ["actividades"]
       });
       
       if (!estudiante){
        throw new BusinessLogicException("El estudiante con el ID proporcionado no fue encontrado", BusinessError.NOT_FOUND);
       }
       
       const actividad = await this.actividadRepository.findOne({
           where: { id: actividadID },
           relations: ["inscritos"]
       });

       if (!actividad) {
           throw new BusinessLogicException("La actividad con el ID proporcionado no fue encontrada", BusinessError.NOT_FOUND);
       }
       
       if (actividad.estado !== 0) {
           throw new BusinessLogicException("La actividad no está en estado 0 para inscripción", BusinessError.PRECONDITION_FAILED);
       }
       
       if (actividad.inscritos && actividad.inscritos.length >= actividad.cupoMaximo) {
           throw new BusinessLogicException("La actividad no tiene cupos disponibles", BusinessError.PRECONDITION_FAILED);
       }
              
       if (estudiante.actividades && 
        estudiante.actividades.some(act => Number(act.id) === Number(actividadID))) {
           throw new BusinessLogicException("El estudiante ya está inscrito en esta actividad", BusinessError.PRECONDITION_FAILED);
       }
       
       estudiante.actividades.push(actividad);
       
       return await this.estudianteRepository.save(estudiante);
   }
}