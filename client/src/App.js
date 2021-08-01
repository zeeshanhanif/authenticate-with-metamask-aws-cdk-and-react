import './App.css';
import { Link, Route, Switch,useHistory,useRouteMatch } from 'react-router-dom';
import Home from './components/Home';
import { useDispatch, useSelector } from 'react-redux';
import { clearWeb3, initWeb3 } from './store/setupSlice';
import { useEffect } from 'react';
import { authLocalStorageToken, clearAuth, loadlocalStorage, login } from './store/authenticationSlice';
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
    dispatch(loadlocalStorage())
  },[])

  useEffect(()=>{
    if(address && !auth) {
      dispatch(login({publicAddress: address}));
    }
    else if(address && auth) {
      dispatch(authLocalStorageToken());
    }
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
      <div style={{backgroundColor:"#D4D4D4"  }}>
        <div style={{ display:"flex" , alignItems:"center",height:"50px", width:"100%"}}>
          <div style={{flexGrow:"1" , paddingLeft:"10px"}}>
            Hello World
          </div>
          <div style={{ display:"flex", flexGrow:"6", justifyContent:"flex-end", paddingRight:"10px" }}>
            {
              !auth &&
              <div style={{display:"inline-block", backgroundColor:"white", borderRadius:"40px", 
                      padding:"8px", border:"1px dashed black", marginLeft:"10px", cursor: "pointer"}} onClick={()=>{
                          dispatch(initWeb3())
                      }}>

                Connect to Wallet
              </div> 
            }
            {
              auth &&
              <div style={{display:"inline-block", backgroundColor:"white", borderRadius:"40px", 
                      padding:"8px", border:"1px dashed black", marginLeft:"10px", cursor: "pointer"}} onClick={()=>{
                          dispatch(clearWeb3());
                          dispatch(clearAuth())
                          //dispatch(initWeb3())
                      }}>

                Diconnect
              </div> 
            }
          </div>
        </div>
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
