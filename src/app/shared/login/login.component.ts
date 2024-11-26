import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { SocialAuthService, GoogleLoginProvider } from '@abacritt/angularx-social-login';


import Swal from 'sweetalert2'
import { LoginService } from './services/login.service';
import { NetworkService } from '../network/network-service.service';
import { EncryptService } from '../services/encrypt.service';
import { Environments } from '../../environments/environments';
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
})

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent implements OnInit {

  title_head: string = '';
  pass_type: string = 'password';
  isConnected: boolean = true;
  actionForm: string = 'sign';

  _show_spinner: boolean = false;
  show_log: boolean = true;
  showPassword: boolean = false;
  text_action_button: string = 'Registrarse';

  showSignIn: boolean = true;
  showLogin: boolean = false;

  version: string = '';
  date_update_version: string = '';

  registerFormOffLine = new FormGroup({
    emailx: new FormControl('')
  })

  registerForm = new FormGroup({
    nombre: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
  })

  constructor(private router: Router, private ncrypt: EncryptService,
    private logUser: LoginService, private authService: SocialAuthService,
    private networkService: NetworkService, private env: Environments) { }

  ngOnInit(): void {
    this.logUser.validacion();
    this.ingresarLog('log');
    this.version = this.env.version;
    this.date_update_version = this.env.date_update_version;
    this.networkService.getOnlineStatus().subscribe((status: boolean) => {
      this.isConnected = status;
      // console.log('Conectado a Internet:', status);
      if (this.isConnected) this.authGoogleClient();
    });
    
  }

  authGoogleClient() {
    this.authService.authState.subscribe((user) => {
      if (user) {
        console.log('Usuario ha iniciado sesión: ', user);
        // Maneja el éxito del inicio de sesión, quizás redirigir a otra página
        this._show_spinner = true;
        this.logUser.logingoogle(user.email).subscribe({
          next: (x: any) => {
            this.registerForm.controls['email'].setValue(x.email);
            this.registerForm.controls['password'].setValue(x.password);
            sessionStorage.setItem('usuarioImg', user.photoUrl);
            this.logIn();
          }, error: (e) => {
            this._show_spinner = false;
            console.error(e);
            Toast.fire({
              icon: "error",
              title: "Something happened on the server"
            });
          }, complete: () => {
            this._show_spinner = false;     
            this.router.navigate(['home']);
          }
        })
      }
    });
  }

  validateActionForm(action: string) {
    this.actionForm = action;
  }

  onSubmit() {
    switch (this.actionForm) {
      case 'sign':
        this.signIn();
        break
      case 'log':
        this.logIn();
        break;
    }
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  ingresarLog(type: any) {
    this.actionForm = type;
    if (this.actionForm == 'sign') { 
      this.showSignIn = true; 
      this.text_action_button = 'Sign Up'; 
      this.title_head = 'Sign Up'; 
    }
    else if (this.actionForm == 'offline') { 
      this.showSignIn = true; 
      this.text_action_button = 'Sign Up Offline'; 
      this.title_head = 'Offline Registration'; 
    }
    else { 
      this.showSignIn = false; 
      this.text_action_button = 'Login'; 
      this.title_head = 'App Login'; 
    }
    return this.actionForm;
  }
  

  logIn() {

    if (
      this.registerForm.controls['email'].value == null ||
      this.registerForm.controls['email'].value == undefined ||
      this.registerForm.controls['email'].value == ''
    ) {
      Toast.fire({
        icon: "warning",
        title: "You must enter an email!"
      });
    }
    else if (
      this.registerForm.controls['password'].value == null ||
      this.registerForm.controls['password'].value == undefined ||
      this.registerForm.controls['password'].value == ''
    ) {
      Toast.fire({
        icon: "warning",
        title: "You must have a password!"
      });
  
    } else {
  
      this._show_spinner = true;
  
      this.modelUserGuardar = {
        email: this.registerForm.controls['email'].value,
        password: this.registerForm.controls['password'].value
      }
  
      this.logUser.login(this.modelUserGuardar).subscribe({
        next: (x: any) => {
     
          Toast.fire({
            icon: "success",
            title: "Login successful!"
          });
  
          const tokenEn: any = this.ncrypt.encryptWithAsciiSeed(x.token, 5, 10);
          sessionStorage.setItem('token', tokenEn);
  
        }, error: (e) => {
          console.error(e);
          Toast.fire({
            icon: "error",
            title: "Something happened on the server"
          });
          this._show_spinner = false;
        }, complete: () => {
          this._show_spinner = true;
          this.router.navigate(['home']);
          this.limpiar();
        }
      });
    }
  }
  

  modelUserGuardar: any = [];
  signIn() {
    // alert('Saving')
    if (this.registerForm.controls['nombre'].value == null ||
      this.registerForm.controls['nombre'].value == undefined ||
      this.registerForm.controls['nombre'].value == '') {
      Toast.fire({
        icon: "warning",
        title: "You must enter a username!"
      });
    }
    else if (
      this.registerForm.controls['email'].value == null ||
      this.registerForm.controls['email'].value == undefined ||
      this.registerForm.controls['email'].value == ''
    ) {
      Toast.fire({
        icon: "warning",
        title: "You must enter an email!"
      });
    }
    else if (
      this.registerForm.controls['password'].value == null ||
      this.registerForm.controls['password'].value == undefined ||
      this.registerForm.controls['password'].value == ''
    ) {
      Toast.fire({
        icon: "warning",
        title: "You must have a password!"
      });
    } else {
      let xuser: any = this.registerForm.controls['nombre'].value;
      sessionStorage.setItem('usuario', xuser);
      let xemail: any = this.registerForm.controls['email'].value;
      sessionStorage.setItem('email', xemail);
      let xpass: any = this.registerForm.controls['password'].value;
  
      this._show_spinner = true;
  
      this.modelUserGuardar = {
        nombre: xuser,
        email: xemail,
        password: xpass,
        estado: 1,
        rol: 1,
        idMembresia: 1,
        fecrea: new Date()
      }
  
      this.logUser.registroUsuario(this.modelUserGuardar).subscribe({
        next: (x) => {
          Toast.fire({
            icon: "success",
            title: "Successfully registered"
          });
        }, error: (e) => {
          this._show_spinner = false;
          Toast.fire({
            icon: "error",
            title: "Something went wrong with the server!"
          });
          console.error(e);
        }, complete: () => {
          this.ingresarLog('log');
          setTimeout(() => {
            let x: any = sessionStorage.getItem('email');
            // // console.warn(x);
            this.registerForm.controls['email'].setValue(x);
          }, 1000);
          this._show_spinner = false;
          this.limpiar();
        }
      });
    }
  }

  limpiar() {
    this.registerForm.controls['nombre'].setValue('');
    this.registerForm.controls['email'].setValue('');
    this.registerForm.controls['password'].setValue('');
    this.actionForm = 'log'
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    if (this.showPassword) {
      this.pass_type = 'text';
    } else {
      this.pass_type = 'password';
    }
  }

}
