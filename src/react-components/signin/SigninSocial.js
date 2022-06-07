import React from 'react';
import google from "./../../assets/images/google.png";
import kakaotalk from "./../../assets/images/kakao-talk.png";
import naver from "./../../assets/images/naver.png";
import facebook from "./../../assets/images/facebook.png";
// refresh token
import KakaoLogin from "react-kakao-login";
import NaverLogin from 'react-naver-login';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import UserService from '../../utilities/apiServices/UserService'
import {naverApp,kakaoApp,facebookApp,googleApp} from '../../utilities/constants'
import Store from '../../utilities/store';
import {toast } from 'react-toastify';

function SigninSocial() {
  toast.configure();
  const signupWithGoogle = (response) => {
    console.log(response);
    try {
      let data ={ggtoken:response.tokenId};
      console.log(data)
      UserService.googleLogin(data).then((response) => {
        Store.setUser(response.data);
        const checkAuth = Store.getUser();
        if(checkAuth)
        {
          window.location = '/'
        }
        else{
          toast.error('Login failed !', {autoClose: 5000})
        }
      }).catch((error) => {
        console.log(error);
      });
    }catch(err) {
        console.log(err);
    } 
  }

  const signupWithFacebook = (response) => {
    try {
      const data = { fbtoken: response.accessToken };
      UserService.facebookLogin(data).then((response) => {
        Store.setUser(response.data);
        const checkAuth = Store.getUser();
        if(checkAuth)
        {
          window.location = '/'
        }
        else{
          toast.error('Login failed !', {autoClose: 5000})
        }
      }).catch((error) => {
        console.log(error);
      });
    }catch(err) {
        console.log(err);
    } 
  }

  const signupWithKakao = (response) => {
    try {
      const data = { kktoken: response.access_token };
      UserService.kakaoLogin(data).then((response) => {
        Store.setUser(response.data);
        const checkAuth = Store.getUser();
        if(checkAuth)
        {
          window.location = '/'
        }
        else{
          toast.error('Login failed !', {autoClose: 5000})
        }
      }).catch((error) => {
        console.log(error);
      });
    }catch(err) {
        console.log(err);
    } 
  }

  const signupWithNaver = (response) => {
    try {
      const data = { nvtoken: response.access_token };
      UserService.naverLogin(data).then((response) => {
        Store.setUser(response.data);
        const checkAuth = Store.getUser();
        if(checkAuth)
        {
          window.location = '/'
        }
        else{
          toast.error('Login failed !', {autoClose: 5000})
        }
      }).catch((error) => {
        console.log(error);
      });
    }catch(err) {
        console.log(err);
    } 
  }

  return (
    <div id="iconGroup">
      <KakaoLogin
        token={kakaoApp.clientID}
        onSuccess={signupWithKakao}
        render={(props) =><a onClick={props.onClick}><img src={kakaotalk}/></a>}
      />

      <NaverLogin 
        clientId={naverApp.clientID}
        callbackUrl={signupWithNaver}
        onSuccess={signupWithNaver}
        render={(props) =><a onClick={props.onClick} className='naver-btn'><img src={naver}/></a>}
      />

      <FacebookLogin
        appId={facebookApp.clientID}
        autoLoad={false}
        fields="name,email,picture"
        callback={signupWithFacebook}
        render={(renderProps) =><a onClick={renderProps.onClick}><img src={facebook}/></a>}
      />

      <GoogleLogin
        clientId={googleApp.clientID}
        onSuccess={signupWithGoogle}
        render={(props) =><a onClick={props.onClick}><img src={google}/></a>}
        cookiePolicy={'single_host_origin'}
      />
    </div>
  );
}

export default SigninSocial;
