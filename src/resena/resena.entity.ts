import { Actividad } from 'src/actividad/actividad.entity';
import { Estudiante } from 'src/estudiante/estudiante.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Resena {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  comentario: string;

  @Column()
  calificacion: number;

  @Column()
  fecha: string;

  @ManyToOne(() => Estudiante, estudiante => estudiante.resenas)
  estudiante: Estudiante;

  @ManyToOne(() => Actividad, actividad => actividad.resenas)
  actividad: Actividad;
}
