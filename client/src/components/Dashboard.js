import { useSelector } from "react-redux";

function Dashboard() {

  const {auth, authLoading} = useSelector((state)=>{
    console.log("state = ", state);
    return state.authenticationReducer
  })

  const {address,balance,web3, settupLoading} = useSelector((state)=>{
    return state.setupReducer
  })

  return (
    <div>
      <div>Dashboard </div>
      {
        (settupLoading || authLoading) && 
        <div>
            Loading.............
            <img src="./imgs/loader.gif" width="50px"/>
        </div>
      }
      {
        auth && auth.accessToken && 
        <div>
            <div>Address: <span>{address}</span></div>
            <div>Balance: <span>{balance}</span></div>
        </div>
      }
    </div>
  );
}
  
  export default Dashboard;
  