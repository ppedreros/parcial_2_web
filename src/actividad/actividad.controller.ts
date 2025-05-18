import { Body, Controller, Get, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors//business-errors/business-errors.interceptor';
import { ActividadDto } from './actividad.dto';
import { ActividadEntity } from './actividad.entity';
import { ActividadService } from './actividad.service';

@Controller('actividades')
@UseInterceptors(BusinessErrorsInterceptor)
export class ActividadController {
    constructor(private readonly actividadService: ActividadService) {}

    @Post()
    async crearActividad(@Body() actividadDto: ActividadDto) {
        const actividad: ActividadEntity = plainToInstance(ActividadEntity, actividadDto);
        return await this.actividadService.crearActividad(actividad);
    }

    @Put(':actividadId/estado/:estado')
    async cambiarEstado(
        @Param('actividadId') actividadId: number,
        @Param('estado') estado: number
    ) {
        return await this.actividadService.cambiarEstado(actividadId, estado);
    }

    @Get(':fecha')
    async findAllActividadesByDate(@Param('fecha') fecha: string) {
        return await this.actividadService.findAllActividadesByDate(fecha);
    }
}