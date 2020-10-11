import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useParams, Redirect, useHistory } from "react-router-dom";
import './App.css';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import { List, arrayMove } from 'react-movable';

const backend_server = "https://vote-chair-backend.ue.r.appspot.com";

const axios = require('axios');

const Vote = (props) => {
  const [options, setOptions] = React.useState(() => { 
    var arr = [...props.data.options]
    if (props.data.randomize) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    return arr;
  });

  return (
    <div className='vote-box'>
      <h2>{props.data.title}</h2>
      <p>{props.data.description}</p>
      <p style={{ color: "#999" }}>(
        {props.data.electionType === 'first-past' ? <span>Select once choice.</span> : null}
        {props.data.electionType === 'ranked' ? <span>Rank the choices any order.</span> : null}
        {props.data.electionType === 'approval' ? <span>Select as many as you are ok with.</span> : null}
      )
      </p>

      {props.data.electionType === 'first-past' ? <VoteMultiple options={options} select_limit={1} setSelection={(selection) => {props.setSelection(props.id, selection)}} /> : null}
      {props.data.electionType === 'ranked' ? <VoteRanked options={options} unranked={true} setSelection={(selection) => {props.setSelection(props.id, selection)}} /> : null}
      {props.data.electionType === 'approval' ? <VoteMultiple options={options} select_limit={0} setSelection={(selection) => {props.setSelection(props.id, selection)}} /> : null}
    </div>
  );

}

const VoteMultiple = (props) => {
  const [options, setOptions] = React.useState(props.options.map((option) =>
    option
  ));
  const [selectedCount, setSelectedCount] = React.useState(0);

  const [currentSelected, setCurrentSelected] = React.useState([]);

  const addedSelectedOption = (option) => {
    var arr = [...currentSelected];
    arr.push(option);
    setCurrentSelected(arr);
    console.log(arr, currentSelected, selectedCount);
    props.setSelection(currentSelected);
  }

  const removeSelectedOption = (option) => {
    var arr = [...currentSelected];
    const index = arr.indexOf(option);
    if (index > -1) {
      arr.splice(index, 1);
    }

    setCurrentSelected(arr);
    props.setSelection(currentSelected);
  }

  const clearSelectedOptions = () => {
    setCurrentSelected([]);
    props.setSelection(currentSelected);
  }

  const toggleCheck = index => e => {
    if (options[index].selected) {
      let arr = [...options];
      arr[index].selected = false;
      setOptions(arr);
      setSelectedCount(selectedCount - 1);
      removeSelectedOption(arr[index].name);
    } else {
      if (props.select_limit === 1) {
        let arr = [...options];
        arr.forEach(element => {
          element.selected = false;
        });
        arr[index].selected = true;
        setOptions(arr);
        setSelectedCount(selectedCount + 1);
        addedSelectedOption(arr[index].name);
      } else if (props.select_limit > selectedCount || props.select_limit === 0) {
        let arr = [...options];
        arr[index].selected = true;
        setOptions(arr);
        setSelectedCount(selectedCount + 1);
        addedSelectedOption(arr[index].name);
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
  const [unranked] = React.useState(props.unranked)

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
            backgroundColor: 
            value.menu ? '#CCC' :
              isDragged || isSelected || !(index < menuIndex || !unranked) || value.disabled
                ? '#EEE' : '#FFF'
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
  // const [options, setOptions] = React.useState([
  //   {
  //     name: "Option 1",
  //     description: "Description"
  //   }
  // ]);
  // const [title, setTitle] = React.useState("Vote Title");
  // const [description, setDescription] = React.useState("Description");
  // const [electionType, setElectionType] = React.useState("first-past");
  // const [require, setRequire] = React.useState(false);
  // const [randomize, setRandomize] = React.useState(false);

  // const addOption = () => {
  //   setOptions([...options, { name: "New Option", description: "Description"}])
  // }

  return (
    <div className='vote-box'>
      <h2 className="editable" onBlur={(e) => {props.updateElement(props.vote.id, "title", e.currentTarget.textContent)}} contentEditable>{props.vote.title}</h2>
      <p className="editable" onBlur={(e) => {props.updateElement(props.vote.id, "description", e.currentTarget.textContent)}} contentEditable>{props.vote.description}</p>

      <div style={{display: "flex"}}>
        <div className="btn-group btn-group-block button-space">
          <button 
            className={"btn" + (props.vote.electionType === "first-past" ? " btn-primary" : "")} 
            onClick={(e) => { props.updateElement(props.vote.id, "electionType", "first-past") }}>First-past-the-post</button>
          <button 
            className={"btn" + (props.vote.electionType === "ranked" ? " btn-primary" : "")}
            onClick={(e) => { props.updateElement(props.vote.id, "electionType", "ranked") }}>Ranked Choice</button>
          <button 
            className={"btn" + (props.vote.electionType === "approval" ? " btn-primary" : "")} 
            onClick={(e) => { props.updateElement(props.vote.id, "electionType", "approval") }}>Approval</button>
        </div>         
        <div className="btn-group btn-group-block button-space">
          <Popup trigger={<button className={"btn btn-link"}><em>Help me to choose!</em></button>} modal>
            <InfoScreen />
          </Popup>
          <Link to="/info"></Link>
        </div>         
      </div>

      <div style={{
        maxWidth: '600px',
        margin: '0px auto',
        padding: '1em'
      }}>

        <ul style={{ padding: 0, margin: 0 }}>
          {props.vote.options.map((option, index) =>
            <li className='vote-option-box' key={option.name}>
              <div className='vote-order'></div>
              <div>
                <EditableVoteOption name={option.name} description={option.description} party={option.party} updateOption={props.updateOption} id={props.vote.id} optionID={index} />
              </div>
            </li>
          )}

          <li className='vote-option-box highlight-hover' onClick={() => {props.addOption(props.vote.id)}}><h3 style={{textAlign: "center"}}>+</h3></li>

        </ul>
      </div>

      <div style={{display: "flex"}}>
        <label className="form-switch" style={{marginRight: "20px"}}>
          <input type="checkbox" checked={props.vote.require} onChange={() => props.updateElement(props.vote.id, "require", !props.vote.require)} />
          <i className="form-icon"></i> Require
        </label>

        <label className="form-switch">
          <input type="checkbox" checked={props.vote.randomize} onChange={() => props.updateElement(props.vote.id, "randomize", !props.vote.randomize)} />
          <i className="form-icon"></i> Randomize order of options
        </label>  
      </div>
    </div>
  )
}

const EditableVoteOption = (props) => {
  return (
    <div className='vote-option'>
      <div style={{ display: "flex" }}>
        <p className='vote-option-title editable' onBlur={(e) => {props.updateOption(props.id, props.optionID, "name", e.currentTarget.textContent)}} contentEditable>{props.name}</p>
        {props.party ? <Party data={props.party} /> : null}
      </div>

      {props.description ? <p className='vote-option-description editable' onBlur={(e) => {props.updateOption(props.id, props.optionID, "description", e.currentTarget.textContent)}}  contentEditable>{props.description}</p> : null}
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
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: "auto" }}>
        <img src="/vote_chair.png" style={{width: "400px", marginBottom: "30px"}} alt="Vote Chair"/>

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
      <div style={{display: "flex", marginTop: "auto"}}>
        <img style={{width: "40%", alignSelf: "end", marginRight: "auto"}} src="/flag.png"/>
        <img style={{width: "25%", alignSelf: "end"}} src="/people.png"/>
      </div>
    </div>
  );
}

const example_vote = `{"title":"Example Election","description":"","anonymous":true,"secret":false,"votes":[{"id":0,"title":"2020 Presidential Election","description":"","electionType":"first-past","require":false,"randomize":false,"options":[{"name":"Donald Trump","description":"Mike Pence"},{"name":"Joe Biden","description":"Kamala Harris"},{"name":"Jo Jorgensen","description":"Spike Cohen "},{"name":"Angela Walker","description":"Description"}]}]}`

const VoteScreen = (props) => {

  const [election, setElection] = React.useState("");

  const [selections, setSelections] = React.useState({});

  let { id } = useParams();
  
  useEffect(() => {
    axios.get(backend_server + '/get_election/' + id)
    .then(function (response) {
      setElection(response.data)
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
  }, []);

  const setSelection = (index, selection) => {
    setSelections(
      {
        ...selections,
        [index]: selection
      }
    )
  }

  const submitVote = () => {
    console.log(selections)
  }

  return (    
    <div className="container grid-md">
      <div>
        <Link to="/"><img src="/vote_chair.png" style={{width: "100px"}} alt="Vote Chair"/></Link>
      </div>
      {election ? 
      <div>
        <div className='vote-box'>
          <h1>{election.title}</h1>
          <p>{election.description}</p>
        </div>
        {election.votes.map((vote, index) => 
          <Vote data={vote} index={index} setSelection={setSelection}/>
        )}
      </div>
      : null }
      <div className='vote-box highlight-hover' onClick={submitVote}><h3 style={{textAlign: "center"}}>Submit Vote</h3></div>
    </div>
  );
}

const CreateScreen = () => {

  const [election, setElection] = React.useState({
    "title": "Election Title",
    "description": "Description",
    "anonymous": true,
    "secret": false,
    "votes": [
      {
        "id": 0,
        "title": "Vote Title",
        "description": "Description",
        "electionType": "first-past",
        "require": false,
        "randomize": false,
        "options": [
          {
            "id": 0,
            "name": "Option",
            "description": "Description"
          }
        ]
      }
    ]
  });

  const updateOuter = (element, value) => {
    setElection({
      ...election,
      [element]: value
      
    })
  }

  const updateElement = (id, element, value) => {
    var arr = [...election.votes];
    arr[id][element] = value;
    setElection({
      ...election,
      "votes": arr
      
    })
  }

  const updateOption = (id, optionId, element, value) => {
    var arr = [...election.votes[id].options];
    arr[optionId][element] = value;
    updateElement(id, "options", arr);
  }

  const addOption = (id) => {
    var arr = [...election.votes[id].options];
    arr.push(
      {
        "id": arr.length,
        "name": "Option",
        "description": "Description"
      }
    );
    updateElement(id, "options", arr);
  }

  const [anonymous, setAnonymous] = React.useState(true);
  const [secret, setSecret] = React.useState(false);

  const addVote = () => {
    setElection({
      ...election,
      "votes": [...election.votes, 
        {
          "id": election.votes.length,
          "title": "Vote Title",
          "description": "Description",
          "electionType": "first-past",
          "require": false,
          "randomize": false,
          "options": [
            {
              "id": 0,
              "name": "Option",
              "description": "Description"
            }
          ]
        }
      ],
  })}

  const history = useHistory();
  
  const publishElection = () => {
    axios.post(backend_server + '/submit_election/', election)
    .then(function (response) {
      console.log(response);
      history.push("/v/" + response.data.id);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  return (
    <div className="container grid-md">
      <div>
        <Link to="/"><img src="/vote_chair.png" style={{width: "100px"}} alt="Vote Chair"/></Link>
      </div>

      <div className='vote-box'>
        <h1 contentEditable onBlur={(e) => {updateOuter("title", e.currentTarget.textContent)}} className="editable">Election Title</h1>
        <p contentEditable onBlur={(e) => {updateOuter("description", e.currentTarget.textContent)}} className="editable">Description</p>
      </div>

      {/* <div style={{display: "flex"}}>
        <div className="btn-group btn-group-block button-space">
          <button className={"btn btn-link"}>Identity</button>
          <button className={"btn" + (anonymous ? " btn-primary" : "")} onClick={() => setAnonymous(true)} alt="Hello">Anonymous</button>
          <button className={"btn" + (!anonymous ? " btn-primary" : "")} onClick={() => setAnonymous(false)}>Recorded</button>
        </div>         
          
        <div className="btn-group btn-group-block button-space">
          <button className={"btn btn-link"}>Results</button>
          <button className={"btn" + (!secret ? " btn-primary" : "")} onClick={() => setSecret(false)}>Live</button>
          <button className={"btn" + (secret ? " btn-primary" : "")}  onClick={() => setSecret(true)}>Secret</button>
        </div> 
      </div> */}
     
      {election.votes.map((vote) => 
        <CreateVote vote={vote} updateElement={updateElement} updateOption={updateOption} addOption={addOption}/>
      )}

      <div className='vote-box highlight-hover' onClick={addVote}><h3 style={{textAlign: "center"}}>+</h3></div>
      <div className='vote-box highlight-hover' onClick={publishElection}><h3 style={{textAlign: "center"}}>Publish...</h3></div>


    </div>
  );
}

const InfoScreen = () => {
  return (
    <div className="container grid-md">
      <h1 id="voting-types">Voting Types</h1>
      <br/>
      <h2 id="single">Single</h2>
      <p>Each person votes once and the choice with the most votes wins.</p>
      <ul>
      <li>Commonly used in government and elections following Robert&#39;s Rules of Order.</li>
      </ul>
      <h2 id="approval">Approval</h2>
      <p>Each person votes as many times as they would like and the choice with the most votes wins.</p>
      <ul>
      <li>Best used for a simple decision between multiple favorable options.</li>
      </ul>
      <h2 id="ranked">Ranked</h2>
      <p>Each voter lists choices in preferential order. The least popular choice is eliminated and its votes get redistributed to their next preference. This is repeated until one choice has reached a majority or they are the only one left.</p>
      <ul>
      <li>Helps to prevent two-party systems and ensures the winner with the broadest support wins.</li>
      </ul>
      <br/>
      <p><a href="https://ballotpedia.org">Learn more at Ballotpedia</a></p>
    </div>
  )
}

const ResultsScreen = () => {

  const election = JSON.parse(example_vote);
  const results = {
    responses: 10,
    votes: [
      {
        id: 1,
        total_votes: 10,
        options: [

        ]
      }
    ]
  };

  return (
    <div className="container grid-md">
      <div>
        <Link to="/"><img src="/vote_chair.png" style={{width: "100px"}} alt="Vote Chair"/></Link>
      </div>

        <div className='vote-box'>
          <h1><span style={{fontWeight: "normal"}}>Results for:</span> {election.title}</h1>
        </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app"></div>
      <div>
        <Switch>
          <Route path="/v/:id">
            <VoteScreen />
          </Route>
          <Route path="/r">
            <ResultsScreen />
          </Route>
          <Route path="/c">
            <CreateScreen />
          </Route>
          <Route path="/info">
            <InfoScreen />
          </Route>
          <Route path="/">
            <HomeScreen />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}


export default App;
