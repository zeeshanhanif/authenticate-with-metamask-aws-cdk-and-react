import './App.css';
import { Link, Route, Switch,useHistory,useRouteMatch } from 'react-router-dom';
import Home from './components/Home';
import { useDispatch, useSelector } from 'react-redux';
import { initWeb3 } from './store/setupSlice';
import { useEffect } from 'react';
import { authLocalStorageToken, loadlocalStorage, login } from './store/authenticationSlice';
import Dashboard from './components/Dashboard';

function App() {
  const history = useHistory();
  const dispatch = useDispatch();
  const address = useSelector((state)=>{
    return state.setupReducer.address
  })

  const {auth} = useSelector((state)=>{
    return state.authenticationReducer
  })

  useEffect(()=>{
    // Access token is stored in localstorage
		//const ls = window.localStorage.getItem(LS_KEY);
		//const auth = ls && JSON.parse(ls);
    dispatch(loadlocalStorage())
  },[])

  useEffect(()=>{
    if(address && !auth) {
      console.log("test 1 use effect ");
      dispatch(login({publicAddress: address}));
    }
    else if(address && auth) {
      console.log("test 2 use effect ");
      //dispatch(login({publicAddress: address}));
      dispatch(authLocalStorageToken());
    }
    console.log("test");
  },[address]) // May be this should be web3
  
  useEffect(()=>{
    if(auth && auth.accessToken) {
        history.push("/dashboard")
    }
    else {
      history.push("/");
    }
  },[auth])


  return (
    <div>
      <div style={{backgroundColor:"#D4D4D4", height:"50px", alignItems:"center", display:"flex"}}>
        Hello World 
        {
          !auth &&
          <div style={{display:"inline-block", backgroundColor:"white", borderRadius:"40px", 
                  padding:"8px", border:"1px dashed black", marginLeft:"10px", cursor: "pointer"}} onClick={()=>{
                      dispatch(initWeb3())
                  }}>

            Connect to Wallet
          </div> 
        }
        
      </div>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/dashboard">
          <Dashboard />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
