import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

import { Course } from '../model/course';

// import * as firebase from 'firebase/app';
// import 'firebase/firestore';

// const config = {
//   apiKey: 'AIzaSyA9ipDmQB_BjjwBDR39rzYMqGqryM2Xuww',
//   authDomain: 'fir-course-9584f.firebaseapp.com',
//   projectId: 'fir-course-9584f',
//   storageBucket: 'fir-course-9584f.appspot.com',
//   messagingSenderId: '44396963243',
//   appId: '1:44396963243:web:b94e41ab12e0546b131eee',
//   measurementId: 'G-V5GCEV9VGS',
// };

// firebase.initializeApp(config);

// const db = firebase.firestore();

// const settings = {};

// db.settings(settings);

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  constructor(private db: AngularFirestore) {}

  ngOnInit() {
    // db.collection('courses')
    //   .get()
    //   .then((snaps) => {
    //     const courses: Course[] = snaps.docs.map((snap) => {
    //       return <Course>{
    //         id: snap.id,
    //         ...snap.data(),
    //       };
    //     });
    //     console.log(courses);
    //   });

    const courseRef = this.db
      .doc('/courses/YhNEF8jYgBr2wu8OsvMB')
      .snapshotChanges()
      .subscribe((snap) => {
        const course: any = snap.payload.data();
        console.log('course.relatedCourseRef', course.relatedCourseRef);
      });

    const ref = this.db
      .doc('courses/PyQx3cNibnJaSAwIcVHi')
      .snapshotChanges()
      .subscribe((snap) => console.log(snap.payload.ref));
  }

  save() {
    const firebaseCourseRef = this.db.doc('/courses/YhNEF8jYgBr2wu8OsvMB').ref;

    const securityCourseRef = this.db.doc('/courses/6CoMPHwguwe4gEIP8tvM').ref;

    const batch = this.db.firestore.batch();

    batch.update(firebaseCourseRef, {
      titles: { description: 'Firebase Course' },
    });

    batch.update(securityCourseRef, {
      titles: { description: 'Security Course' },
    });

    const batch$ = of(batch.commit());
    batch$.subscribe();
  }

  async runTransaction() {
    const newCounter = await this.db.firestore.runTransaction(
      async (transaction) => {
        console.log('Running transaction...');

        const courseRef = this.db.doc('/courses/YhNEF8jYgBr2wu8OsvMB').ref;

        const snap = await transaction.get(courseRef);

        const course = <Course>snap.data();

        console.log('current lessons count = ', course.lessonsCount);

        const lessonsCount = course.lessonsCount + 1;

        transaction.update(courseRef, { lessonsCount });

        return lessonsCount;
      }
    );

    console.log('result lessons count = ', newCounter);
  }
}
