import React from "react";
import ReactDOM from "react-dom";
import registerTelemetry from "../../telemetry";
import "../../utils/theme";
import "../../react-components/styles/global.scss";
import "../../assets/stylesheets/globals.scss";
import "../../assets/login/signin.scss";
import "../../assets/login/utils.scss";
import UserService from '../../utilities/apiServices/UserService'
import SigninSocial from '../signin/SigninSocial';
import { validateEmail ,validateLength,validateLengthSpace} from '../../utils/commonFunc';
import Store from "../../utilities/store";
import { FaHome } from "react-icons/fa";
import StoreHub from "../../storage/store";
import hubChannel from '../../utils/hub-channel'
const store = new StoreHub();
registerTelemetry("/signup", "Hubs Sign Up Page");

export  function ResetPasswordPage() {
    return (
        <ResetPasswordForm />
    );
}

class ResetPasswordForm extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            submitted: false,
            error:'',
            disabled:false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }
    remove2Token =()=> {
        store.removeHub();
        Store.removeUser();
    }

    handleSubmit(e) {
        e.preventDefault();
        this.setState({ submitted: true });
        const {email} = this.state;
        const data = {email};
        if (validateEmail(email) === 'incorrect-email') {
            this.setState({ error : 'Invalid email!' });
            return false;
        }
        else{
            // UserService.signupWithEmail(data).then((res) => {
            //     this.setState({ disabled : true });
            //     if(res.result == 'ok'){
            //         remove2Token();
            //         window.location = `/?page=warning-verify&email=${res.data.email}`;
            //     }
            //     else
            //     if(res.result == 'fail'){// && result.error == 'duplicated_email'
            //         if(res.error == 'duplicated_email'){
            //             this.setState({ error : 'Your email already exists' });
            //             this.setState({ disabled : false });
            //         }
            //     }
            // })
        }
    }

  render(){
    const { displayName,email, password,repassword, submitted ,error,disabled} = this.state;
    const MesageError=()=> {  
        if(error){
          return(
            <div className="error-form">{error}</div>
          ) 
        }
        else{
          return(
            <></>
          ) 
        }
    }
    return(
      <div className="limiter">
        <div className="container-login100">
            <div className="wrap-login100 p-l-80 p-r-80 p-t-62 p-b-62">
                <div className="gohome">
                    <a href="./"><FaHome size={30}/></a>
                </div>
                <form className="login100-form validate-form flex-sb flex-w" name="form" onSubmit={this.handleSubmit}>
                    <span className="login100-form-title">
                        Reset Password
                    </span>
                    <div className="p-t-13 p-b-9">
                        <span className="txt1">
                            Email
                        </span>
                    </div>
                    <div className="wrap-input100 validate-input" data-validate="Email is required">
                        <input className="input100" type="email" name="email" value={email} onChange={this.handleChange}  />
                        <span className="focus-input100"></span>
                    </div>
                    <div className="container-login100-form-btn m-t-27 m-b-30">
                        <button className="login100-form-btn" disabled={false}>
                            Reset Password
                        </button>
                    </div>
                    <MesageError/>
                    <div id="alternativeLogin">
                        <label className="txt1">Or sign in with: <a href='/?page=signin' className='btn_signup'>Sign In?</a></label>
                        <SigninSocial/>
                    </div>
                </form>
            </div>
        </div>
    </div>
    )
  }
}
