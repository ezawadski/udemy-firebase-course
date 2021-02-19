import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import { Course } from '../model/course';
import { Lesson } from '../model/lesson';
import { CoursesService } from '../services/courses.service';

@Component({
  selector: 'course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css'],
})
export class CourseComponent implements OnInit {
  course: Course;
  lessons: Lesson[];
  lastPageLoaded = 0;
  isLoading = false;

  displayedColumns = ['seqNo', 'description', 'duration'];

  dataSource: any;

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.course = this.route.snapshot.data['course'];
    this.coursesService
      .findLessons(this.course.id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((lessons) => (this.lessons = lessons));
  }

  loadMore() {
    this.isLoading = true;

    this.lastPageLoaded++;
    this.coursesService
      .findLessons(this.course.id, 'asc', this.lastPageLoaded)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((lessons) => (this.lessons = this.lessons.concat(lessons)));
  }
}
