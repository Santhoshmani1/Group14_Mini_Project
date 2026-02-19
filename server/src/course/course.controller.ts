import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course-dto';

@Controller('course')
export class CourseController {
    constructor(private courseService: CourseService){}

    @Get()
    getAllCourse(){
        return this.courseService.findAll();
    }

    @Get()
    getByName(name: string){
        return this.courseService.findByName(name);
    }
    @Get(':id')
    getById(@Param('id') id: number){
        return this.courseService.findById(id);
    }
    @Post()
    createCourse(@Body() createCourseDto:CreateCourseDto){
        return this.courseService.create(createCourseDto);
    }
}
