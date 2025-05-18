import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { ActividadEntity } from './actividad.entity';

@Injectable()
export class ActividadService {
   constructor(
       @InjectRepository(ActividadEntity)
       private readonly actividadRepository: Repository<ActividadEntity>
   ){}

   async crearActividad(actividad: ActividadEntity): Promise<ActividadEntity> {
       if (!actividad.titulo || actividad.titulo.length < 15) {
           throw new BusinessLogicException(
               "El título de la actividad debe tener al menos 15 caracteres",
               BusinessError.BAD_REQUEST
           );
       }

       const simbolosRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
       if (simbolosRegex.test(actividad.titulo)) {
           throw new BusinessLogicException(
               "El título de la actividad no puede contener símbolos",
               BusinessError.BAD_REQUEST
           );
       }
       actividad.estado = 0;
       
       return await this.actividadRepository.save(actividad);
   }

   async cambiarEstado(actividadID: number, estado: number): Promise<ActividadEntity> {
       if (estado < 0 || estado > 2) {
           throw new BusinessLogicException(
               "El estado debe ser 0 (abierta), 1 (cerrada) o 2 (finalizada)",
               BusinessError.BAD_REQUEST
           );
       }

       const actividad = await this.actividadRepository.findOne({
           where: { id: actividadID },
           relations: ["inscritos"]
       });

       if (!actividad) {
           throw new BusinessLogicException(
               "La actividad con el ID proporcionado no fue encontrada",
               BusinessError.NOT_FOUND
           );
       }

       const inscritosCount = actividad.inscritos ? actividad.inscritos.length : 0;
       const porcentajeOcupacion = (inscritosCount / actividad.cupoMaximo) * 100;

       console.log(`Actividad ID ${actividadID}: Inscritos ${inscritosCount}, Cupo Máximo ${actividad.cupoMaximo}, Porcentaje ${porcentajeOcupacion.toFixed(2)}%`);


       if (Number(estado) === 1 && porcentajeOcupacion < 80.0) {
           throw new BusinessLogicException(
               "La actividad solo puede ser cerrada si el 80% del cupo está lleno",
               BusinessError.PRECONDITION_FAILED
           );
       }

       if (Number(estado) === 2 && inscritosCount < actividad.cupoMaximo) {
           throw new BusinessLogicException(
               "La actividad solo puede ser finalizada si no hay cupo disponible",
               BusinessError.PRECONDITION_FAILED
           );
       }
       actividad.estado = estado;
       
       return await this.actividadRepository.save(actividad);
   }

   async findAllActividadesByDate(fecha: string): Promise<ActividadEntity[]> {
       return await this.actividadRepository.find({
           where: { fecha: fecha },
           relations: ["inscritos", "resenas"]
       });
   }
}