import { Body, Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { EstudianteDto } from './estudiante.dto';
import { EstudianteEntity } from './estudiante.entity';
import { EstudianteService } from './estudiante.service';

@Controller('estudiantes')
@UseInterceptors(BusinessErrorsInterceptor)
export class EstudianteController {
    constructor(private readonly estudianteService: EstudianteService) {}

    @Get(':estudianteId')
    async findEstudianteById(@Param('estudianteId') estudianteId: number) {
        return await this.estudianteService.findEstudianteById(estudianteId);
    }

    @Post()
    async crearEstudiante(@Body() estudianteDto: EstudianteDto) {
        const estudiante: EstudianteEntity = plainToInstance(EstudianteEntity, estudianteDto);
        return await this.estudianteService.crearEstudiante(estudiante);
    }

    @Post(':estudianteId/:actividadId')
    async inscribirseActividad(
        @Param('estudianteId') estudianteId: number,
        @Param('actividadId') actividadId: number
    ) {
        return await this.estudianteService.inscribirseActividad(estudianteId, actividadId);
    }
}