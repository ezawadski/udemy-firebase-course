import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import * as firebase from 'firebase/app';
import 'firebase/firestore';

import { Course } from '../model/course';

const config = {
  apiKey: 'AIzaSyA9ipDmQB_BjjwBDR39rzYMqGqryM2Xuww',
  authDomain: 'fir-course-9584f.firebaseapp.com',
  projectId: 'fir-course-9584f',
  storageBucket: 'fir-course-9584f.appspot.com',
  messagingSenderId: '44396963243',
  appId: '1:44396963243:web:b94e41ab12e0546b131eee',
  measurementId: 'G-V5GCEV9VGS',
};

firebase.initializeApp(config);

const db = firebase.firestore();

const settings = {};

db.settings(settings);

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    db.collection('courses')
      .get()
      .then((snaps) => {
        const courses: Course[] = snaps.docs.map((snap) => {
          return <Course>{
            id: snap.id,
            ...snap.data(),
          };
        });

        console.log(courses);
      });
  }
}
