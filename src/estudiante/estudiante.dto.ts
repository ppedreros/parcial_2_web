import { IsNotEmpty, IsString, IsInt, IsEmail } from 'class-validator';

export class EstudianteDto {
  @IsInt()
  @IsNotEmpty()
  readonly cedula: number;
  
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;
  
  @IsEmail()
  @IsNotEmpty()
  readonly correo: string;
  
  @IsString()
  @IsNotEmpty()
  readonly programa: string;
  
  @IsInt()
  @IsNotEmpty()
  readonly semestre: number;
}