import { IsNotEmpty, IsString, IsInt, MinLength, Matches, Max, Min } from 'class-validator';

export class ActividadDto {
  @IsString()
  @IsNotEmpty()
  readonly titulo: string;
  
  @IsString()
  @IsNotEmpty()
  readonly fecha: string;
  
  @IsInt()
  @IsNotEmpty()
  readonly cupoMaximo: number;
}