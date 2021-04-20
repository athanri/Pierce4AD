import logo from './logo.svg';
import "./App.css";
import React, { Component } from "react";
import { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { createTodo, deleteTodo, updateTodo } from './graphql/mutations';
import { listNotes, listTodos } from './graphql/queries';
import { onCreateTodo } from './graphql/subscriptions';

// function App() {
//   return (
//     <div className="flex flex-column items-left justify-center pa3 bg-washed-red"> 
//     <AmplifySignOut />
//     <h1 className="code f2-1">Aidan's Amplify Test Notes App </h1>
//       { /* Note Form */}
//       <form className="mb3"><input type="text" className="pa2 f4" placeholder="Write your note here"/>
//       <button className="pa2 f4" type="submit">Add Note</button>
//       </form>
      
//       {/* Notes List */}
//       <div>


//       </div>

//       </div>
//   );
// }



class App extends Component {
  state = { 
    note: "",
    notes: []
};

async componentDidMount() {
  const result = await API.graphql(graphqlOperation(listTodos))
  this.setState ({ notes: result.data.listTodos.items})
}

handleChangeNote= event => {
  this.setState({ note: event.target.value })
}

checkExistingNote = () => { 
  const { notes, id } = this.state
  if (id) {
    //check if a note for the index in state
  const validNote = notes.findIndex(note => note.id === id) > -1
  return validNote;
}
return false;
}


 
//Add notes
handleAddNote = async event => {
  const {note, notes} = this.state;
  event.preventDefault()
  // if there is an existing, then update it else add a new note
  if (this.checkExistingNote()) {
    this.updateExistingNote()

  } else {
  const input = { note: note}
 const result = await API.graphql(graphqlOperation(createTodo, { input: input}))
 const newNote = result.data.createTodo
 const updatedNotes = [newNote, ...notes]
 this.setState({ notes: updatedNotes, note:""})
  }
};

updateExistingNote = async () => { 
  const { notes, id, note} = this.state;
  const input = { id, note}
  const result = await API.graphql(graphqlOperation(updateTodo,{input }))
  const updatedNote = result.data.updateTodo;
  const index = notes.findIndex(note => note.id === updatedNote.id )
 const updatedNotes = [
   ...notes.slice(0, index),
updatedNote, ...notes.slice(index + 1)
 ]
 this.setState({notes: updatedNotes, note: "", id: ""})
}


 //Delete existing notes 
handleDeleteTodo = async noteId => {

const {notes } = this.state
const input = { id: noteId}
const result = await API.graphql(graphqlOperation(deleteTodo, {input }))
const detletedNoteId = result.data.deleteTodo.id;
const updatedNotes = notes.filter(note => note.id !== detletedNoteId)

this.setState({ notes: updatedNotes})

}

//Update an existing note. 

handleSetNote = ({note, id}) => this.setState({note, id});
  render() {
    const { id, notes, note } = this.state
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-blue"> 
      <AmplifySignOut />
      <h1 className="pa2 f5 f4-ns fw6 mid-gray">Aidan's Amplify Note Reminders Application </h1>
      <h4 className="pa2 f5 f4-ns fw6 mid-gray"><span>&bull; </span>Add notes</h4>
      <h4 className="pa2 f5 f4-ns fw6 mid-gray"><span>&bull; </span>Remove notes by clicking on x to the right.</h4>
      <h4 className="pa2 f5 f4-ns fw6 mid-gray"><span>&bull; </span>Update existing notes by clicking on it, modify note and click update button.</h4>      
      { /* Notes reminder Form */}
      <form onSubmit={this.handleAddNote} className="mb3"><input type="text" className="pa2 f4" placeholder="Write your note here" onChange={this.handleChangeNote} value={note}/>
      {/*Add ternary here to change state of button if adding or updating a */}
      <button className="pa2 f6 link dim br1 ba ph3 pv2 mb2 dib dark-green" type="submit"> {id ? "Update Note" : "Add Note"}</button>
    
       </form>
       {/* Notes reminder list */}
      <div>
        {notes.map(item => ( 
        <div key={item.id} className="list pl0 ml0 center mw5 ba b--light-silver br3">
          <li onClick={() => this.handleSetNote(item)} className="ph3 pv2 bb b--light-silver" > 
          {item.note}</li>
          <button onClick={() => this.handleDeleteTodo(item.id)} className="bg-transparent bn f4"><span>&times;</span></button>  

        </div>
        ))}
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true});
// export default withAuthenticator(App);