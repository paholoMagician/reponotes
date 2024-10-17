import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2'
import { LoginService } from './services/login.service';
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
  actionForm: string = 'sign';
  _show_spinner: boolean = false;
  show_log: boolean = true;
  showPassword: boolean = false;
  text_action_button: string = 'Registrarse';
  registerForm = new FormGroup({
    nombre: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
  })

  title_head: string = 'Registro';
  pass_type: string = 'password';
  constructor(private router: Router, private logUser: LoginService) { }

  ngOnInit(): void {
    this.logUser.validacion();
  }

  // validate() {
  //   let x: any = sessionStorage.getItem('usuario')
  //   if( x != null || x != undefined || x != '' ) {
  //     this.show_log = true;
  //     this.router.navigate(['/home']);
  //   } else {
  //     this.show_log = false;
  //     this.router.navigate(['/login']);
  //   }
  // }


  validateActionForm(action: string) {
    this.actionForm = action;
  }

  showSignIn: boolean = true;
  showLogin: boolean = false;
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

  ingresarLog(type: any) {
    this.actionForm = type;
    if (this.actionForm == 'sign') { this.showSignIn = true; this.text_action_button = 'Registrarse'; this.title_head = 'Registro'; }
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

      this.modelUserGuardar = {
        email: this.registerForm.controls['email'].value,
        password: this.registerForm.controls['password'].value
      }

      this.logUser.login(this.modelUserGuardar).subscribe({
        next: (x: any) => {
          Toast.fire({
            icon: "success",
            title: "Ingreso correcto!"
          });

          sessionStorage.setItem('usuario', x.nombre);
          sessionStorage.setItem('email', x.email);
          sessionStorage.setItem('id', x.id);

        }, error: (e) => {
          console.error(e);
          Toast.fire({
            icon: "error",
            title: "Algo ha pasado en el servidor"
          });
        }, complete: () => {
          this.router.navigate(['home']);
          this.limpiar();
        }
      })
    }
  }

  modelUserGuardar: any = [];
  signIn() {
    alert('Guardando')
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

      this.modelUserGuardar = {
        nombre: xuser,
        email: xemail,
        xpass: xpass
      }

      this.logUser.registroUsuario(this.modelUserGuardar).subscribe({
        next: (x) => {
          Toast.fire({
            icon: "success",
            title: "Registrado con éxito"
          });
        }, error: (e) => {
          Toast.fire({
            icon: "error",
            title: "Algo ha pasado con el servidor!"
          });
          console.error(e);
        }, complete: () => {
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
    if ( this.showPassword ) {
      this.pass_type = 'text';
    } else {
      this.pass_type = 'password';
    }
  }

}
