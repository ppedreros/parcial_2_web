import { ActividadEntity } from 'src/actividad/actividad.entity';
import { ResenaEntity } from 'src/resena/resena.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable, ManyToOne } from 'typeorm';

@Entity()
export class EstudianteEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  cedula: number;

  @Column()
  nombre: string;

  @Column()
  correo: string;

  @Column()
  programa: string;

  @Column()
  semestre: number;

  @ManyToMany(() => ActividadEntity, actividad => actividad.inscritos)
  @JoinTable()
  actividades: ActividadEntity[];

  @OneToMany(() => ResenaEntity, resena => resena.estudiante)
  resenas: ResenaEntity[];
}
