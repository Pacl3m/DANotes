import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];

  firestore: Firestore = inject(Firestore);

  unsubNotes;
  unsubMarkedNotes;
  unsubTrash;

  constructor() {

    this.unsubNotes = this.subNotesList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
    this.unsubTrash = this.subTrahsList();

  }

  deleteNote(colId: 'trash' | 'notes', docId: string) {
    deleteDoc(this.getSingleDocRef(colId, docId)).catch(
      (err) => {
        console.error(err);
      }
    );
  }

  updateNote(note: Note) {
    if (note.id) {
      let returnDocRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      let cleanJson = this.getCleanJson(note);
      console.log(returnDocRef, '1', cleanJson, '2', note.id)
      updateDoc(returnDocRef, cleanJson).catch(
        (err) => {
          console.error(err);
        }
      );
    }
  };

  getCleanJson(note: Note): {} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    }
  }

  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes'
    } else {
      return 'trash'
    }
  }

  addNote2(item: Note, colId: 'trash' | 'notes') {
    if (colId == 'notes') {
      addDoc(this.getNotesRef(), item).catch(
        (err) => { console.error(err) })
        .then((docRef) => { console.log("Document written with ID: ", docRef?.id) })
    } else {
      addDoc(this.getTrashRef(), item).catch(
        (err) => { console.error(err) })
        .then((docRef) => { console.log("Document written with ID: ", docRef?.id) })
    }
  }

  addNote(item: Note, colId: 'trash' | 'notes') {
    addDoc(this.getRef(colId), item).catch(
      (err) => { console.error(err) })
      .then((docRef) => { console.log("Document written with ID: ", docRef?.id) })
  }

  subNotesList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subMarkedNotesList() {
    let q = query(this.getNotesRef(), where("marked", "==", true));
    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = [];
      list.forEach(element => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subTrahsList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  ngonDestroy() {
    this.unsubNotes();
    this.unsubTrash();
  }

  getRef(colId: string) {
      return collection(this.firestore, colId);
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
