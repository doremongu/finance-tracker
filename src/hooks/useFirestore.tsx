import { useReducer, useEffect, useState } from "react"
import { projectFirestore, timestamp } from "../firebase/config"
import { collection, addDoc, deleteDoc } from 'firebase/firestore'

let initialState = {
  document: null,
  isPending: false,
  error: null,
  success: null
}

const firestoreReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'IS_PENDING':
      return { isPending: true, document: null, success: false, error: null }
    case 'ADDED_DOCUMENT':
      return { isPending: false, document: action.payload, success: true, error: null }
    case 'DELETED_DOCUMENT':
      return { isPending: false, document: null, success: true, error: null }
    case 'ERROR':
      return { isPending: false, document: null, success: false, error: action.payload }
    default:
      return state
  }
}

export const useFirestore = (collectionPath: string) => {
  const [response, dispatch] = useReducer(firestoreReducer, initialState)
  const [isCancelled, setIsCancelled] = useState(false)

  // collection ref
  const ref = collection(projectFirestore, collectionPath);

  // only dispatch is not cancelled
  const dispatchIfNotCancelled = (action: any) => {
    if (!isCancelled) {
      dispatch(action)
    }
  }

  // add a document
  const addDocument = async (doc: any) => {
    dispatch({ type: 'IS_PENDING' })
    console.log(ref)
    try {
      const createdAt = timestamp.fromDate(new Date())
      const addedDocument = await addDoc(ref, { ...doc, createdAt })
      dispatchIfNotCancelled({ type: 'ADDED_DOCUMENT', payload: addedDocument })
    }
    catch (err: any) {
      dispatchIfNotCancelled({ type: 'ERROR', payload: err.message })
    }
  }

  // delete a document
  const deleteDocument = async (doc: any) => {
    dispatch({ type: 'IS_PENDING' })

    try {
      await deleteDoc(doc)
      dispatchIfNotCancelled({ type: 'DELETED_DOCUMENT' })
    }
    catch (err) {
      dispatchIfNotCancelled({ type: 'ERROR', payload: 'could not delete' })
    }
  }

  useEffect(() => {
    return () => setIsCancelled(true)
  }, [])

  return { addDocument, deleteDocument, response }

}
