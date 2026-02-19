import { IsNotEmpty, IsNumber, IsString, IsUrl, isURL } from 'class-validator';

export class CreateCourseDto {

  
  @IsString()
  @IsNotEmpty()
  title: string = '';

  @IsString()
  @IsNotEmpty()
  description: string = '';

  @IsString()
  @IsNotEmpty()
  instructor: string = '';

  @IsString()
  @IsNotEmpty()
  duration: string = '';

  @IsNumber()
  price: number = 0;

  @IsUrl()
  thumbnailUrl: string = '';

  @IsUrl()
  videoUrl: string = '';

  @IsString()
  @IsNotEmpty()
  language: string = '';


}
