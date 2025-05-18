import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ActividadEntity } from './actividad.entity';
import { ActividadService } from './actividad.service';
import { EstudianteEntity } from '../estudiante/estudiante.entity';
import { BusinessError } from '../shared/errors/business-errors';
import { faker } from '@faker-js/faker';

describe('ActividadService', () => {
  let service: ActividadService;
  let actividadRepository: Repository<ActividadEntity>;
  let estudianteRepository: Repository<EstudianteEntity>;
  let actividadesList: ActividadEntity[];
  let estudiantesList: EstudianteEntity[];
  let fechaEspecifica: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ActividadService],
    }).compile();

    service = module.get<ActividadService>(ActividadService);
    actividadRepository = module.get<Repository<ActividadEntity>>(getRepositoryToken(ActividadEntity));
    estudianteRepository = module.get<Repository<EstudianteEntity>>(getRepositoryToken(EstudianteEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    await actividadRepository.clear();
    await estudianteRepository.clear();

    estudiantesList = [];
    for (let i = 0; i < 10; i++) {
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

    fechaEspecifica = faker.date.future().toISOString().split('T')[0];

    actividadesList = [];
    for (let i = 0; i < 3; i++) {
      const actividad = new ActividadEntity();
      actividad.titulo = faker.lorem.sentence(5).replace(/[^\w\s]/g, '').substring(0, 30).padEnd(15, 'a');
      
      actividad.fecha = i === 0 ? fechaEspecifica : faker.date.future().toISOString().split('T')[0];
      
      actividad.cupoMaximo = faker.number.int({ min: 5, max: 30 });
      actividad.estado = 0;
      actividad.inscritos = [];
      actividad.resenas = [];
      
      actividadesList.push(await actividadRepository.save(actividad));
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Pruebas para crearActividad

  it('crearActividad should create an activity successfully', async () => {
    const nuevaActividad = new ActividadEntity();
    nuevaActividad.titulo = faker.lorem.words(8).padEnd(15, 'a');
    nuevaActividad.fecha = faker.date.future().toISOString().split('T')[0];
    nuevaActividad.cupoMaximo = faker.number.int({ min: 10, max: 30 });
    
    const resultado = await service.crearActividad(nuevaActividad);
    
    expect(resultado).not.toBeNull();
    expect(resultado.titulo).toEqual(nuevaActividad.titulo);
    expect(resultado.fecha).toEqual(nuevaActividad.fecha);
    expect(resultado.cupoMaximo).toEqual(nuevaActividad.cupoMaximo);
    expect(resultado.estado).toEqual(0);
    
    const almacenada = await actividadRepository.findOne({ where: { id: resultado.id } });
    expect(almacenada).not.toBeNull();
    if (almacenada) {
      expect(almacenada.titulo).toEqual(nuevaActividad.titulo);
    }
  });

  it('crearActividad should fail for title with less than 15 characters', async () => {
    const nuevaActividad = new ActividadEntity();
    nuevaActividad.titulo = faker.lorem.words(2).substring(0, 14);
    nuevaActividad.fecha = faker.date.future().toISOString().split('T')[0];
    nuevaActividad.cupoMaximo = faker.number.int({ min: 10, max: 30 });
    
    await expect(() => service.crearActividad(nuevaActividad)).rejects.toHaveProperty(
      'type',
      BusinessError.BAD_REQUEST,
    );
  });

  it('crearActividad should fail for title with symbols', async () => {
    const nuevaActividad = new ActividadEntity();
    nuevaActividad.titulo = `${faker.lorem.words(5)}@#$%^`.padEnd(20, 'a');
    nuevaActividad.fecha = faker.date.future().toISOString().split('T')[0];
    nuevaActividad.cupoMaximo = faker.number.int({ min: 10, max: 30 });
    
    await expect(() => service.crearActividad(nuevaActividad)).rejects.toHaveProperty(
      'type',
      BusinessError.BAD_REQUEST,
    );
  });

  // Pruebas para cambiarEstado

  it('cambiarEstado should change activity state to closed when 80% capacity is reached', async () => {
    const actividad = actividadesList[0];
    actividad.cupoMaximo = 5;
    
    actividad.inscritos = estudiantesList.slice(0, 4);
    await actividadRepository.save(actividad);
    
    const resultado = await service.cambiarEstado(actividad.id, 1);
    
    expect(resultado).not.toBeNull();
    expect(resultado.estado).toEqual(1);
    
    const actualizada = await actividadRepository.findOne({ where: { id: actividad.id } });
    expect(actualizada).not.toBeNull();
    
    if (actualizada) {
      expect(actualizada.estado).toEqual(1);
    }
  });

  it('cambiarEstado should change activity state to finished when full capacity is reached', async () => {
    const actividad = actividadesList[1];
    actividad.cupoMaximo = 5;
    
    actividad.inscritos = estudiantesList.slice(0, 5);
    await actividadRepository.save(actividad);
    
    const resultado = await service.cambiarEstado(actividad.id, 2);
    
    expect(resultado).not.toBeNull();
    expect(resultado.estado).toEqual(2);
    
    const actualizada = await actividadRepository.findOne({ where: { id: actividad.id } });
    expect(actualizada).not.toBeNull();
    
    if (actualizada) {
      expect(actualizada.estado).toEqual(2);
    }
  });

  it('cambiarEstado should fail when trying to close activity with less than 80% capacity', async () => {
    const actividad = actividadesList[2];
    actividad.cupoMaximo = 10;
    
    actividad.inscritos = estudiantesList.slice(0, 7);
    await actividadRepository.save(actividad);
    
    await expect(() => service.cambiarEstado(actividad.id, 1)).rejects.toHaveProperty(
      'type',
      BusinessError.PRECONDITION_FAILED,
    );
  });

  it('cambiarEstado should fail when trying to finish activity with available capacity', async () => {
    const actividad = actividadesList[2];
    actividad.cupoMaximo = 10;
    
    actividad.inscritos = estudiantesList.slice(0, 9);
    await actividadRepository.save(actividad);
    
    await expect(() => service.cambiarEstado(actividad.id, 2)).rejects.toHaveProperty(
      'type',
      BusinessError.PRECONDITION_FAILED,
    );
  });

  // Pruebas para findAllActividadesByDate

  it('findAllActividadesByDate should return activities for a specific date', async () => {
    const resultado = await service.findAllActividadesByDate(fechaEspecifica);
    
    expect(resultado).not.toBeNull();
    expect(Array.isArray(resultado)).toBeTruthy();
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado[0].fecha).toEqual(fechaEspecifica);
  });

  it('findAllActividadesByDate should return empty array for date with no activities', async () => {
    const fechaSinActividades = '2099-12-31';
    
    const resultado = await service.findAllActividadesByDate(fechaSinActividades);
    
    expect(resultado).not.toBeNull();
    expect(Array.isArray(resultado)).toBeTruthy();
    expect(resultado.length).toEqual(0);
  });
});