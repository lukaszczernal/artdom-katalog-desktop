import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PagesService {

  private docRef: AngularFirestoreDocument;

  constructor(private readonly db: AngularFirestore) {
    this.docRef = db.doc('catalog/pages');
  }

  getPages() {
    return this.docRef.valueChanges().pipe(map(res => res.all));
  }

  setPages(data: any[]) { // TODO typings
    this.docRef.update({all: data});
  }
}
