import { COURSES, findLessonsForCourse } from './db-data';

import * as firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyA9ipDmQB_BjjwBDR39rzYMqGqryM2Xuww',
  authDomain: 'fir-course-9584f.firebaseapp.com',
  projectId: 'fir-course-9584f',
  storageBucket: 'fir-course-9584f.appspot.com',
  messagingSenderId: '44396963243',
  appId: '1:44396963243:web:b94e41ab12e0546b131eee',
  measurementId: 'G-V5GCEV9VGS',
};

console.log('Uploading data to the database with the following config:\n');

console.log(JSON.stringify(config));

console.log(
  '\n\n\n\nMake sure that this is your own database, so that you have write access to it.\n\n\n'
);

const app = firebase.initializeApp(config);
const db = firebase.firestore();

main().then((r) => console.log('Done.'));

async function uploadData() {
  const courses = await db.collection('courses');
  for (let course of Object.values(COURSES)) {
    const newCourse = removeId(course);
    const courseRef = await courses.add(newCourse);
    const lessons = await courseRef.collection('lessons');
    const courseLessons = findLessonsForCourse(course['id']);
    console.log(`Uploading course ${course['titles']['description']}`);
    for (const lesson of courseLessons) {
      const newLesson = removeId(lesson);
      await lessons.add(newLesson);
    }
  }
}

function removeId(data: any) {
  const newData: any = { ...data };
  delete newData.id;
  return newData;
}

async function main() {
  try {
    console.log('Start main...\n\n');
    await uploadData();
    console.log('\n\nClosing Application...');
    await app.delete();
  } catch (e) {
    console.log('Data upload failed, reason:', e, '\n\n');
  }
}
