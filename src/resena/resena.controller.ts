import { Body, Controller, Param, Post, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { ResenaDto } from './resena.dto';
import { ResenaEntity } from './resena.entity';
import { ResenaService } from './resena.service';

@Controller('resenas')
@UseInterceptors(BusinessErrorsInterceptor)
export class ResenaController {
    constructor(private readonly resenaService: ResenaService) {}

    @Post('actividades/:actividadId/estudiantes/:estudianteId')
    async agregarResena(
        @Param('estudianteId') estudianteId: number,
        @Param('actividadId') actividadId: number,
        @Body() resenaDto: ResenaDto
    ) {
        const resena: ResenaEntity = plainToInstance(ResenaEntity, resenaDto);
        return await this.resenaService.agregarResena(estudianteId, actividadId, resena);
    }
}