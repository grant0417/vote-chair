import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import './App.css';
import * as parties from './parties.js'

import { List, arrayMove } from 'react-movable';

const Vote = (props) => {
  // Order, Order (not all), One, Multiple

  return (
    <div className='vote-box'>
      <h2>{props.data.name}</h2>
      <p>{props.data.description}</p>
      <p style={{ color: "#999" }}>(
        {props.data.select_options === 'select' && props.data.select_limit === 0 ? <span>Select any number of choices.</span> : null}
        {props.data.select_options === 'select' && props.data.select_limit === 1 ? <span>Select your choice.</span> : null}
        {props.data.select_options === 'select' && props.data.select_limit > 1 && !props.data.select_all ? <span>Select up to {props.data.select_limit} choices.</span> : null}
        {props.data.select_options === 'select' && props.data.select_limit > 1 && props.data.select_all ? <span>Select {props.data.select_limit} choices.</span> : null}
        {props.data.select_options === 'order' ? <span>Put the options in your selected order.</span> : null}
        {props.data.select_options === 'order-some' && props.data.select_limit === 0 ? <span>Put as many options in order as you want.</span> : null}
        {props.data.select_options === 'order-some' && props.data.select_limit > 0 && props.data.select_all ? <span>Put {props.data.select_limit} options in order.</span> : null}
        {props.data.select_options === 'order-some' && props.data.select_limit > 0 && !props.data.select_all ? <span>Put up to {props.data.select_limit} options in order.</span> : null}
        )
      </p>

      {props.data.select_options === 'select' ? <VoteMultiple options={props.data.options} select_limit={props.data.select_limit} /> : null}
      {props.data.select_options === 'order' ? <VoteRanked options={props.data.options} unranked={false} /> : null}

    </div>
  );

}

const VoteMultiple = (props) => {
  const [options, setOptions] = React.useState(props.options.map((option) =>
    option
  ));

  const [selectedCount, setSelectedCount] = React.useState(0);

  const toggleCheck = index => e => {
    if (options[index].selected) {
      let arr = [...options];
      arr[index].selected = false;
      setOptions(arr);
      setSelectedCount(selectedCount - 1);
    } else {
      if (props.select_limit === 1) {
        let arr = [...options];
        arr.forEach(element => {
          element.selected = false;
        });
        arr[index].selected = true;
        setOptions(arr);
      } else if (props.select_limit > selectedCount || props.select_limit === 0) {
        let arr = [...options];
        arr[index].selected = true;
        setOptions(arr);
        setSelectedCount(selectedCount + 1);
      }
    }

  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0px auto',
      padding: '1em'
    }}>

      <ul style={{ padding: 0, margin: 0 }}>
        {options.map((option, index) =>
          <li className='vote-option-box' onClick={toggleCheck(index)} key={option.name} style={{ cursor: "pointer" }}>
            <div className='vote-order'>
              {option.selected ? "X" : null}
            </div>
            <div>
              <VoteOption name={option.name} description={option.description} party={option.party} />
            </div>
          </li>
        )}
      </ul>
    </div>
  )
}

const VoteRanked = (props) => {
  const [options, setOptions] = React.useState(() => {
    var arr = [...props.options]

    if (props.unranked) {
      arr.unshift({
        name: "Unranked",
        menu: true,
        disabled: true
      });
    }

    return arr.map((option) =>
      option
    )
  });

  const [menuIndex, setMenuIndex] = React.useState(0)
  const [unranked, setUnranked] = React.useState(props.unranked)

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0px auto',
      padding: '1em'
    }}>
      <List
        values={options}
        onChange={({ oldIndex, newIndex }) => {
          setOptions(arrayMove(options, oldIndex, newIndex));

          if (newIndex >= menuIndex && oldIndex < menuIndex) {
            setMenuIndex(menuIndex - 1);
          } else if (newIndex <= menuIndex && oldIndex > menuIndex) {
            setMenuIndex(menuIndex + 1);
          }
        }}

        renderList={({ children, props, isDragged }) => <ul
          {...props}
          style={{ padding: 0, margin: 0, cursor: isDragged ? 'grabbing' : undefined }}>{children}
        </ul>}

        renderItem={({ value, props, index, isDragged, isSelected }) => <li
          {...props}
          className='vote-option-box'
          style={{
            ...props.style,
            cursor: isDragged
              ? 'grabbing'
              : value.disabled
                ? 'default'
                : 'grab',
            backgroundColor: isDragged || isSelected
              ? '#EEE'
              : value.disabled
                ? '#EEE'
                : '#FFF'
          }}>
          {!value.menu ?
            <div className='vote-order'>
              {index < menuIndex || !unranked ? index + 1 : null}
            </div>
            : null
          }
          <div>
            <VoteOption name={value.name} description={value.description} party={value.party} />
          </div>
        </li>}
      />
    </div>
  );

}

const VoteOption = (props) => {
  return (
    <div className='vote-option'>
      <div style={{ display: "flex" }}>
        <p className='vote-option-title'>{props.name}</p>
        {props.party ? <Party data={props.party} /> : null}
      </div>


      {props.description ? <p className='vote-option-description'>{props.description}</p> : null}
    </div>
  );
}

const Party = (props) => {
  return (
    <div className="chip">
      {props.data.logo ? <img src={props.data.logo} className="avatar avatar-sm" style={{ backgroundColor: "#eef0f3" }} alt={props.data.name} /> : null}
      {props.data.name}
    </div>
  )
}

const CreateVote = (props) => {
  const [options, setOptions] = React.useState([
    {
      name: "Option 1",
      description: "Description"
    }
  ]);

  const addOption = () => {
    setOptions([...options, { name: "New Option", description: "Description"}])
  }

  return (
    <div className='vote-box'>
      <h2 className="editable" contentEditable>Name</h2>
      <p className="editable" contentEditable>description</p>

      <div style={{
        maxWidth: '600px',
        margin: '0px auto',
        padding: '1em'
      }}>

        <ul style={{ padding: 0, margin: 0 }}>
          {options.map((option, index) =>
            <li className='vote-option-box' key={option.name}>
              <div className='vote-order'></div>
              <div>
                <EditableVoteOption name={option.name} description={option.description} party={option.party} />
              </div>
            </li>
          )}

          <li className='vote-option-box highlight-hover' onClick={addOption}><h3 style={{textAlign: "center"}}>+</h3></li>

        </ul>
      </div>
    </div>
  )
}

const EditableVoteOption = (props) => {
  return (
    <div className='vote-option'>
      <div style={{ display: "flex" }}>
        <p className='vote-option-title editable' contentEditable>{props.name}</p>
        {props.party ? <Party data={props.party} /> : null}
      </div>

      {props.description ? <p className='vote-option-description editable'  contentEditable>{props.description}</p> : null}
    </div>
  );
}

const ElectionTitle = (props) => {
  return (
    <div className='vote-box'>
      <h1>Title</h1>
      <p>Description</p>
    </div>
  );
}

const vote1 = {
  name: "President",
  description: "The leader of the orginization!",
  type: "approval", // ranked, first-past, 
  select_options: "order", //order-some, single, multiple
  select_limit: 0, // Limit the number of options for multiple and order-some
  select_all: false, // Require non partial selection for multiple and order-some
  options: [
    {
      name: "Madison Kozee",
      description: "A BETTER choice",
    },
    {
      name: "Grant Gurvis",
      description: "An ok choice :P",
    },
    {
      name: "2",
    },
    {
      name: "3",
    },
  ]
}

const president_2020 = {
  name: "2020 United States presidential election",
  description: "",
  type: "approval", // ranked, first-past, 
  select_options: "select", //order-some, order
  select_limit: 1, // Limit the number of options for multiple and order-some
  select_all: false, // Require non partial selection for multiple and order-some
  options: [
    {
      name: "Joe Biden",
      description: "Kamala Harris",
      party: parties.democratic
    },
    {
      name: "Donald Trump",
      description: "Mike Pence",
      party: parties.republican
    },
    {
      name: "Jo Jorgensen",
      description: "Spike Cohen",
      party: parties.libertarian
    },
    {
      name: "Howie Hawkins",
      description: "Angela Walker",
      party: parties.green_party
    },
  ]
}

const ammendment = {
  name: "Florida Amendment 1: Citizen Requirement for Voting Initiative",
  description: "Enshrine in the state constitution the exclusivity of voting rights for U.S. Citizens",
  type: "approval", // ranked, first-past, 
  select_options: "select", //order-some, order
  select_limit: 1, // Limit the number of options for select and order-some (0 is unlimited)
  select_all: false, // Require non partial selection for multiple and order-some
  options: [
    {
      name: "For",
    },
    {
      name: "Against",
    },
  ]
}

const HomeScreen = () => {
  const [code, setCode] = React.useState("");

  return (
    <div style={{ display: "flex", flexDirection:"column", justifyContent: "center", height: "100vh" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <img src="vote_chair.png" style={{width: "400px", marginBottom: "30px"}}/>

        <div style={{ display: "flex", marginBottom: "20px" }}>
          <input type='text'
            placeholder='Code'
            className='form-input'
            style={{ textTransform: "uppercase", fontFamily: "monospace" }}
            onChange={(e) => { setCode(e.target.value) }}
          />
          <Link to={"/v/" + code}><input type='button' value='>' className='btn' /></Link>
        </div>

        <div>
          <Link to="/c/" style={{ width: "100%" }}><input type='button' value='Create' className='btn' /></Link>
        </div>
      </div>
    </div>
  );
}

const VoteScreen = () => {
  return (
    <div className="container grid-md">
      <div>
        <Link to="/"><h1>Chair</h1></Link>
      </div>
      <ElectionTitle />
      <Vote data={vote1} />
      <Vote data={president_2020} />
      <Vote data={ammendment} />
    </div>
  );
}

const CreateScreen = () => {
  const [votes, setVote] = React.useState([
    <CreateVote />
  ]);

  const addVote = () => {
    setVote([...votes, <CreateVote />])
  }

  return (
    <div className="container grid-md">
      <div>
        <Link to="/"><h1>Chair</h1></Link>
      </div>

      <div>
        Anonymous
        Recorded
      </div>

      <div>
        Live
        Secret
      </div>

      {votes.map((vote) => 
        vote
      )}

      <div className='vote-box highlight-hover' onClick={addVote}><h3 style={{textAlign: "center"}}>+</h3></div>


    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app"></div>
      <div>
        <Switch>
          <Route path="/v">
            <VoteScreen />
          </Route>
          <Route path="/c">
            <CreateScreen />
          </Route>
          <Route path="/">
            <HomeScreen />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
}


export default App;
