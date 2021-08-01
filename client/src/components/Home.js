import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

function Home() {
    const history = useHistory();
    const {address,balance, web3LoadingError,settupLoading} = useSelector((state)=>{
        return state.setupReducer
    })
    const {loginSignupError,auth, authLoading} = useSelector((state)=>{
        return state.authenticationReducer
    })

    return (
    <div>
        <div>Home</div>
        {
            web3LoadingError && <div style={{color:"red"}}>ERROR : <span>{web3LoadingError}</span></div>
        }
        {
            loginSignupError && <div style={{color:"red"}}>ERROR : <span>{loginSignupError}</span></div>
        }
        
        {
            (settupLoading || authLoading) && 
            <div>
                Loading.............
                <img src="./imgs/loader.gif" width="50px"/>
            </div>
        }
        
    </div>
    );
}

export default Home;
