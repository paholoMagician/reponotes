import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { SocialAuthService, GoogleLoginProvider } from '@abacritt/angularx-social-login';


import Swal from 'sweetalert2'
import { LoginService } from './services/login.service';
import { NetworkService } from '../network/network-service.service';
import { EncryptService } from '../services/encrypt.service';
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

  title_head: string = 'Registro';
  pass_type: string = 'password';
  isConnected: boolean = true;
  actionForm: string = 'sign';

  _show_spinner: boolean = false;
  show_log: boolean = true;
  showPassword: boolean = false;
  text_action_button: string = 'Registrarse';

  showSignIn: boolean = true;
  showLogin: boolean = false;

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
    private networkService: NetworkService) { }

  ngOnInit(): void {
    this.logUser.validacion();
    this.networkService.getOnlineStatus().subscribe((status: boolean) => {
      this.isConnected = status;
      // console.log('Conectado a Internet:', status);
      if (this.isConnected) this.authGoogleClient();
    });

  }

  authGoogleClient() {
    this.authService.authState.subscribe((user) => {
      if (user) {
        // console.log('Usuario ha iniciado sesión:', user);
        // Maneja el éxito del inicio de sesión, quizás redirigir a otra página
        this._show_spinner = true;
        this.logUser.logingoogle(user.email).subscribe({
          next: (x: any) => {
            sessionStorage.setItem('id', x.id);
            sessionStorage.setItem('usuario', x.nombre);
            sessionStorage.setItem('email', user.email);
            sessionStorage.setItem('usuarioImg', user.photoUrl);
            Toast.fire({
              icon: "success",
              title: "Haz ingresado correctamente."
            });
          }, error: (e) => {
            this._show_spinner = false;
            console.error(e);
            Toast.fire({
              icon: "error",
              title: "Algo ha pasado en nuestro servidor."
            });
          }, complete: () => {
            this._show_spinner = false;
            this.router.navigate(['home']);
          }
        })
      }
    });
  }

  onSubmitOffline() {
    if (this.registerFormOffLine.controls['emailx'].value == undefined || this.registerFormOffLine.controls['emailx'].value == null) {
      Toast.fire({
        icon: "warning",
        title: "Debes escribir un email, para poder validarlo!"
      });
    } else {
      let xdata: any = localStorage.getItem('data_tipo_lista');
      let email: any = this.registerFormOffLine.controls['emailx'].value;
      if (xdata != undefined || xdata != null) {
        let data: any = xdata ? JSON.parse(xdata) : [];

        if (data[0].email == email) {
          sessionStorage.setItem('email', email);
          sessionStorage.setItem('id', data[0].iduser);
          sessionStorage.setItem('usuario', email.toString().slice(0, 6));
          Toast.fire({
            icon: "success",
            title: "Ya tienes datos asociados a este correo.\n Ingreso correcto."
          });
          this.router.navigate(['home']);
        }
        else {
          sessionStorage.setItem('email', email);
          sessionStorage.setItem('usuario', email.toString().slice(0, 6));
          sessionStorage.setItem('id', (0).toString());
          Toast.fire({
            icon: "success",
            title: "Haz ingresado en modo offline."
          });
          this.router.navigate(['home']);
        }
      } else {
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('id', (0).toString());
        sessionStorage.setItem('usuario', email.toString().slice(0, 6));
        Toast.fire({
          icon: "success",
          title: "Haz ingresado en modo offline."
        });
        this.router.navigate(['home']);
      }
    }
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
    if (this.actionForm == 'sign') { this.showSignIn = true; this.text_action_button = 'Registrarse'; this.title_head = 'Registro'; }
    else if (this.actionForm == 'offline') { this.showSignIn = true; this.text_action_button = 'Registrarse offline'; this.title_head = 'Registro OffLine'; }
    else { this.showSignIn = false; this.text_action_button = 'Ingresar'; this.title_head = 'Ingreso a la app'; }
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
        title: "Debes escribir un email!"
      });
    }
    else if (

      this.registerForm.controls['password'].value == null ||
      this.registerForm.controls['password'].value == undefined ||
      this.registerForm.controls['password'].value == '') {

      Toast.fire({
        icon: "warning",
        title: "Debes tener una contraseña!"
      });

    } else {

      this._show_spinner = true;

      this.modelUserGuardar = {
        email: this.registerForm.controls['email'].value,
        password: this.registerForm.controls['password'].value
      }

      this.logUser.login(this.modelUserGuardar).subscribe({
        next: (x: any) => {
          console.warn('TOKEN');
          console.warn(x);
          Toast.fire({
            icon: "success",
            title: "Ingreso correcto!"
          });

          const tokenEn: any = this.ncrypt.encryptWithAsciiSeed(x.token, 5, 10);
          sessionStorage.setItem('token', tokenEn);

        }, error: (e) => {
          console.error(e);
          Toast.fire({
            icon: "error",
            title: "Algo ha pasado en el servidor"
          });
          this._show_spinner = false;
        }, complete: () => {
          this._show_spinner = true;
          this.router.navigate(['home']);
          this.limpiar();
        }
      })
    }
  }

  modelUserGuardar: any = [];
  signIn() {
    // alert('Guardando')
    if (this.registerForm.controls['nombre'].value == null ||
      this.registerForm.controls['nombre'].value == undefined ||
      this.registerForm.controls['nombre'].value == '') {
      Toast.fire({
        icon: "warning",
        title: "Debes escribir un nombre de usuario!"
      });
    }
    else if (
      this.registerForm.controls['email'].value == null ||
      this.registerForm.controls['email'].value == undefined ||
      this.registerForm.controls['email'].value == ''
    ) {
      Toast.fire({
        icon: "warning",
        title: "Debes escribir un email!"
      });
    }
    else if (
      this.registerForm.controls['password'].value == null ||
      this.registerForm.controls['password'].value == undefined ||
      this.registerForm.controls['password'].value == '') {
      Toast.fire({
        icon: "warning",
        title: "Debes tener una contraseña!"
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
            title: "Registrado con éxito"
          });
        }, error: (e) => {
          this._show_spinner = false;
          Toast.fire({
            icon: "error",
            title: "Algo ha pasado con el servidor!"
          });
          console.error(e);
        }, complete: () => {
          this.ingresarLog('log');
          setTimeout(() => {
            let x: any = sessionStorage.getItem('email');
            console.warn(x);
            this.registerForm.controls['email'].setValue(x);
          }, 1000);
          this._show_spinner = false;
          this.limpiar();
        }
      })
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
