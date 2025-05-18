import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class ResenaDto {
  @IsString()
  @IsNotEmpty()
  readonly comentario: string;
  
  @IsInt()
  @IsNotEmpty()
  readonly calificacion: number;
  
  @IsString()
  @IsNotEmpty()
  readonly fecha: string;
}