import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, addDoc, collection, collectionData, doc, onSnapshot } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  firestore: Firestore = inject(Firestore);

  unsubNotes;
  unsubTrash;

  constructor() {

    this.unsubNotes = this.subNotesList();
    this.unsubTrash = this.subTrahsList();

  }

  addNote(item: {}) {
    addDoc(this.getNotesRef(), item).catch(
      (err) => { console.error(err) })
      .then((docRef) => { console.log("Document written with ID: ", docRef?.id) })
  }

  subNotesList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
        ;
      });
    });
  }

  subTrahsList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
        ;
      });
    });
  }

  ngonDestroy() {
    this.unsubNotes();
    this.unsubTrash();
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId)
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false,
    }
  }
}
