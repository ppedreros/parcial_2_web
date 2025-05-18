import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { EstudianteEntity } from './estudiante.entity';
import { EstudianteService } from './estudiante.service';
import { ActividadEntity } from '../actividad/actividad.entity';
import { BusinessError } from '../shared/errors/business-errors';
import { faker } from '@faker-js/faker';

describe('EstudianteService', () => {
  let service: EstudianteService;
  let estudianteRepository: Repository<EstudianteEntity>;
  let actividadRepository: Repository<ActividadEntity>;
  let estudiantesList: EstudianteEntity[];
  let actividadesList: ActividadEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [EstudianteService],
    }).compile();

    service = module.get<EstudianteService>(EstudianteService);
    estudianteRepository = module.get<Repository<EstudianteEntity>>(getRepositoryToken(EstudianteEntity));
    actividadRepository = module.get<Repository<ActividadEntity>>(getRepositoryToken(ActividadEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    await estudianteRepository.clear();
    await actividadRepository.clear();

    actividadesList = [];
    for (let i = 0; i < 3; i++) {
      const actividad = new ActividadEntity();
      actividad.titulo = faker.lorem.words(5).padEnd(15, 'a');
      actividad.fecha = faker.date.future().toISOString().split('T')[0];
      actividad.cupoMaximo = faker.number.int({ min: 5, max: 30 });
      actividad.estado = 0;
      actividad.inscritos = [];
      actividad.resenas = [];
      
      actividadesList.push(await actividadRepository.save(actividad));
    }

    estudiantesList = [];
    for (let i = 0; i < 5; i++) {
      const estudiante = new EstudianteEntity();
      estudiante.cedula = parseInt(faker.string.numeric(8));
      estudiante.nombre = faker.person.fullName();
      estudiante.correo = faker.internet.email();
      estudiante.programa = faker.company.name();
      estudiante.semestre = faker.number.int({ min: 1, max: 10 });
      estudiante.actividades = [];
      estudiante.resenas = [];

      estudiantesList.push(await estudianteRepository.save(estudiante));
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Pruebas para findEstudianteById

  it('findEstudianteById should return a student by id', async () => {
    const estudiante: EstudianteEntity = estudiantesList[0];
    const encontrado = await service.findEstudianteById(estudiante.id);
    expect(encontrado).not.toBeNull();
    expect(encontrado.cedula).toEqual(estudiante.cedula);
    expect(encontrado.nombre).toEqual(estudiante.nombre);
    expect(encontrado.correo).toEqual(estudiante.correo);
  });

  it('findEstudianteById should throw an exception for invalid id', async () => {
    await expect(() => service.findEstudianteById(0)).rejects.toHaveProperty(
      'type',
      BusinessError.NOT_FOUND,
    );
  });

  // Pruebas para crearEstudiante

  it('crearEstudiante should create a student successfully', async () => {
    const nuevoEstudiante = new EstudianteEntity();
    nuevoEstudiante.cedula = parseInt(faker.string.numeric(8));
    nuevoEstudiante.nombre = faker.person.fullName();
    nuevoEstudiante.correo = faker.internet.email();
    nuevoEstudiante.programa = faker.company.name();
    nuevoEstudiante.semestre = faker.number.int({ min: 1, max: 10 });
    
    const resultado = await service.crearEstudiante(nuevoEstudiante);
    expect(resultado).not.toBeNull();
    expect(resultado.cedula).toEqual(nuevoEstudiante.cedula);
    expect(resultado.nombre).toEqual(nuevoEstudiante.nombre);
    expect(resultado.correo).toEqual(nuevoEstudiante.correo);
    
    const almacenado = await estudianteRepository.findOne({ where: { id: resultado.id } });
    expect(almacenado).not.toBeNull();
    if (almacenado) {
      expect(almacenado.nombre).toEqual(nuevoEstudiante.nombre);
    }
  });

  it('crearEstudiante should throw an exception for invalid email', async () => {
    const nuevoEstudiante = new EstudianteEntity();
    nuevoEstudiante.cedula = parseInt(faker.string.numeric(8));
    nuevoEstudiante.nombre = faker.person.fullName();
    nuevoEstudiante.correo = 'correo_invalido'; 
    nuevoEstudiante.programa = faker.company.name();
    nuevoEstudiante.semestre = faker.number.int({ min: 1, max: 10 });
    
    await expect(() => service.crearEstudiante(nuevoEstudiante)).rejects.toHaveProperty(
      'type',
      BusinessError.BAD_REQUEST,
    );
  });

  it('crearEstudiante should throw an exception for invalid semester', async () => {
    const nuevoEstudiante = new EstudianteEntity();
    nuevoEstudiante.cedula = parseInt(faker.string.numeric(8));
    nuevoEstudiante.nombre = faker.person.fullName();
    nuevoEstudiante.correo = faker.internet.email();
    nuevoEstudiante.programa = faker.company.name();
    nuevoEstudiante.semestre = 12; 
    
    await expect(() => service.crearEstudiante(nuevoEstudiante)).rejects.toHaveProperty(
      'type',
      BusinessError.BAD_REQUEST,
    );
  });

  // Pruebas para inscribirseActividad

  it('inscribirseActividad should enroll a student in an activity', async () => {
    const estudiante = estudiantesList[0];
    const actividad = actividadesList[0];
    
    const resultado = await service.inscribirseActividad(estudiante.id, actividad.id);
    
    expect(resultado).not.toBeNull();
    expect(resultado.actividades.length).toEqual(1);
    expect(resultado.actividades[0].id).toEqual(actividad.id);
    
    const actividadActualizada = await actividadRepository.findOne({
      where: { id: actividad.id },
      relations: ['inscritos']
    });
    
    expect(actividadActualizada).not.toBeNull();
    if (actividadActualizada) {
      expect(actividadActualizada.inscritos.some(est => est.id === estudiante.id)).toBeTruthy();
    }
  });

  it('inscribirseActividad should fail if student is already enrolled', async () => {
    const estudiante = estudiantesList[1];
    const actividad = actividadesList[1];
    
    await service.inscribirseActividad(estudiante.id, actividad.id);
    
    await expect(() => 
      service.inscribirseActividad(estudiante.id, actividad.id)
    ).rejects.toHaveProperty(
      'type',
      BusinessError.PRECONDITION_FAILED,
    );
  });

  it('inscribirseActividad should fail if activity has no available spots', async () => {
    const actividad = actividadesList[2];
    actividad.cupoMaximo = 1;
    await actividadRepository.save(actividad);
    
    await service.inscribirseActividad(estudiantesList[0].id, actividad.id);
    
    await expect(() => 
      service.inscribirseActividad(estudiantesList[1].id, actividad.id)
    ).rejects.toHaveProperty(
      'type',
      BusinessError.PRECONDITION_FAILED,
    );
  });
});