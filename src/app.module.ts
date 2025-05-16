import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EstudianteModule } from './estudiante/estudiante.module';

@Module({
  imports: [EstudianteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
