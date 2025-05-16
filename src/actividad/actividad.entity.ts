import { EstudianteEntity } from 'src/estudiante/estudiante.entity';
import { Resena } from 'src/resena/resena.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ActividadEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  titulo: string;

  @Column()
  fecha: string;

  @Column()
  cupoMaximo: number;

  @Column()
  estado: number;

  @ManyToMany(() => EstudianteEntity, estudiante => estudiante.actividades)
  inscritos: EstudianteEntity[];

  @OneToMany(() => ResenaEntity, resena => resena.actividad)
  resenas: ResenaEntity[];
}
