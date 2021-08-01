import { useSelector } from "react-redux";

function Dashboard() {

  const {auth} = useSelector((state)=>{
    console.log("state = ", state);
    return state.authenticationReducer
  })

  const {address,balance,web3} = useSelector((state)=>{
    return state.setupReducer
  })

  return (
    <div>
      <div>Dashboard new</div>
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
  