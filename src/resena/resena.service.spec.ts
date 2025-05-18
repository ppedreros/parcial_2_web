import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ResenaEntity } from './resena.entity';
import { ResenaService } from './resena.service';
import { EstudianteEntity } from '../estudiante/estudiante.entity';
import { ActividadEntity } from '../actividad/actividad.entity';
import { BusinessError } from '../shared/errors/business-errors';
import { faker } from '@faker-js/faker';

describe('ResenaService', () => {
  let service: ResenaService;
  let resenaRepository: Repository<ResenaEntity>;
  let estudianteRepository: Repository<EstudianteEntity>;
  let actividadRepository: Repository<ActividadEntity>;
  let estudiante: EstudianteEntity;
  let actividad: ActividadEntity;
  let actividadNoFinalizada: ActividadEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ResenaService],
    }).compile();

    service = module.get<ResenaService>(ResenaService);
    resenaRepository = module.get<Repository<ResenaEntity>>(getRepositoryToken(ResenaEntity));
    estudianteRepository = module.get<Repository<EstudianteEntity>>(getRepositoryToken(EstudianteEntity));
    actividadRepository = module.get<Repository<ActividadEntity>>(getRepositoryToken(ActividadEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    await resenaRepository.clear();
    await estudianteRepository.clear();
    await actividadRepository.clear();

    estudiante = new EstudianteEntity();
    estudiante.cedula = parseInt(faker.string.numeric(8));
    estudiante.nombre = faker.person.fullName();
    estudiante.correo = faker.internet.email();
    estudiante.programa = faker.company.name();
    estudiante.semestre = faker.number.int({ min: 1, max: 10 });
    estudiante.actividades = [];
    estudiante.resenas = [];
    await estudianteRepository.save(estudiante);

    actividad = new ActividadEntity();
    actividad.titulo = faker.lorem.words(5).replace(/[^\w\s]/g, '').padEnd(15, 'a'); 
    actividad.fecha = faker.date.past().toISOString().split('T')[0];
    actividad.cupoMaximo = faker.number.int({ min: 20, max: 50 });
    actividad.estado = 2; 
    actividad.inscritos = [estudiante];
    actividad.resenas = [];
    await actividadRepository.save(actividad);

    actividadNoFinalizada = new ActividadEntity();
    actividadNoFinalizada.titulo = faker.lorem.words(5).replace(/[^\w\s]/g, '').padEnd(15, 'a');
    actividadNoFinalizada.fecha = faker.date.future().toISOString().split('T')[0];
    actividadNoFinalizada.cupoMaximo = faker.number.int({ min: 20, max: 50 });
    actividadNoFinalizada.estado = 0; 
    actividadNoFinalizada.inscritos = [estudiante]; 
    actividadNoFinalizada.resenas = [];
    await actividadRepository.save(actividadNoFinalizada);

    estudiante.actividades = [actividad, actividadNoFinalizada];
    await estudianteRepository.save(estudiante);
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Pruebas para agregarResena

  it('agregarResena should add a review to a finished activity', async () => {
    const nuevaResena = new ResenaEntity();
    nuevaResena.comentario = faker.lorem.paragraph();
    nuevaResena.calificacion = faker.number.int({ min: 1, max: 5 });
    nuevaResena.fecha = new Date().toISOString().split('T')[0];
    
    const resultado = await service.agregarResena(estudiante.id, actividad.id, nuevaResena);
    
    expect(resultado).not.toBeNull();
    expect(resultado.comentario).toEqual(nuevaResena.comentario);
    expect(resultado.calificacion).toEqual(nuevaResena.calificacion);
    expect(resultado.estudiante.id).toEqual(estudiante.id);
    expect(resultado.actividad.id).toEqual(actividad.id);
    
    const almacenada = await resenaRepository.findOne({ 
      where: { id: resultado.id },
      relations: ['estudiante', 'actividad']
    });
    
    expect(almacenada).not.toBeNull();
    if (almacenada) {
      expect(almacenada.estudiante.id).toEqual(estudiante.id);
      expect(almacenada.actividad.id).toEqual(actividad.id);
    }
  });

  it('agregarResena should fail for student not enrolled in activity', async () => {
    const estudianteNoInscrito = new EstudianteEntity();
    estudianteNoInscrito.cedula = parseInt(faker.string.numeric(8));
    estudianteNoInscrito.nombre = faker.person.fullName();
    estudianteNoInscrito.correo = faker.internet.email();
    estudianteNoInscrito.programa = faker.company.name();
    estudianteNoInscrito.semestre = faker.number.int({ min: 1, max: 10 });
    estudianteNoInscrito.actividades = [];
    estudianteNoInscrito.resenas = [];
    await estudianteRepository.save(estudianteNoInscrito);
    
    const nuevaResena = new ResenaEntity();
    nuevaResena.comentario = faker.lorem.paragraph();
    nuevaResena.calificacion = faker.number.int({ min: 1, max: 5 });
    
    await expect(() => 
      service.agregarResena(estudianteNoInscrito.id, actividad.id, nuevaResena)
    ).rejects.toHaveProperty(
      'type',
      BusinessError.PRECONDITION_FAILED,
    );
  });
});