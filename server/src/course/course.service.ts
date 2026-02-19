import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course-dto';
import { title } from 'process';
import { Course } from './couse.interface';
@Injectable()
export class CourseService {
  private date: Date = new Date();
  private course: Course[] = [
    {
      id: 1,
      title: 'React Basics',
      description: 'Learn React',
      instructor: 'Shanu',
      duration: '6 weeks',
      price: 4999,
      videoUrl: '',
      thumbnailUrl: '',
      language: 'string',
      updatedAt: this.date,
      createdAt: this.date,
    },
  ];

  findAll() {
    return this.course;
  }
  create(createDto: CreateCourseDto) {
    const newCourse = {
      id: this.course.length + 1,
      title: createDto.title,
      description: createDto.description,
      instructor: createDto.instructor,
      duration: createDto.duration,
      price: createDto.price,
      videoUrl: createDto.videoUrl,
      thumbnailUrl: createDto.thumbnailUrl,
      language: createDto.language,
      updatedAt: this.date,
      createdAt: this.date,
    };
    this.course.push(newCourse);
    return newCourse;
  }

  findByName(name: String) {
    return this.course.filter((course) =>
      course.title.toLowerCase().includes(name.toLocaleLowerCase()),
    );
  }

  findById(id: number) {
    
    return this.course.find((course) => course.id == id);
  }
}
