import { Component, OnInit } from '@angular/core';
import { WiseService } from '../services/wise.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  origen = {
    usuraio: "Vadhir",
    correo: "vh7558272@gmail.com",
    numeroWise: "P6201700"
  }

  solicitudes = [
    {
      usuario: "Juan Pérez",
      correo: "juanperez3908765@gmail.com"
    },
    {
      usuario: "José Santos",
      correo: "jose123@gmail.com"
    },
    {
      usuario: "Mario Castañeda",
      correo: "mario123@gmail.com"
    },
    {
      usuario: "Pedro Picapiedra",
      correo: "pedro123@gmail.com"
    },
    {
      usuario: "Jefferson Varela",
      correo: "jeffersonvarela57@gmail.com"
    }
  ]

  private destinatarios = []
  constructor(private wiseService: WiseService) {}

  ngOnInit() {
    //this.getCuentaOrigen();
    this.getDestinatarios();
  }

  getCuentaOrigen(){
    this.wiseService.getCuentaOrigen().subscribe({
      next: (response: any) => {
        console.log(response)
      },
      error: (error) => console.error(error)
    });
  }

  getDestinatarios(){
    this.wiseService.getDestinatarios().subscribe({
      next: (response: any) => {
        this.destinatarios = response;
        console.log(this.destinatarios);
      },
      error: (error) => console.error(error)
    });
  }

  procesar(solicitud: any){
    this.wiseService.crearCotizacion().subscribe({
      next: (response) => {
        console.log(response);
        this.consultarRequerimientosDestinatario(response);

        //antes de crear el destinatario verificamos los requerimientos

        this.verificarDestinatario(solicitud, response);
      },
      error: (error) => console.error(error)
    });

  }

  verificarDestinatario(solicitud: any, cotizacion: any){

    const destinatario = this.destinatarios.filter((d: any) => d.accountHolderName === solicitud.usuario);
    console.log(destinatario);

    if (destinatario.length > 0) {
      //actualizamos la cotización con el destinatiario
      console.log('actualizamos cotización');
      this.updateCotizacionConUsuario(destinatario[0], cotizacion);
    }else{
      //creamos un nuevo destinatario
      console.log('creamos el destinatario');
      this.crearDestinatario(solicitud, cotizacion);
    }
  }

  crearDestinatario(destinatario: any, cotizacion: any){
    this.wiseService.crearDestinatario(destinatario).subscribe({
      next: (response: any) => {
        console.log(response);
        console.log('actualizamos cotización');
        this.updateCotizacionConUsuario(response, cotizacion);
      },
      error: (error) => console.error(error)
    });
  }

  updateCotizacionConUsuario(cuentaDestino: any, cotizacion: any){
    this.wiseService.actualizarCotizacion(cuentaDestino, cotizacion).subscribe({
      next: (response: any) => {
        console.log(response);
        this.getRequerimientos(cuentaDestino, response);
      },
      error: (error) => console.error(error)
    });
  }

  getRequerimientos(cuentaDestino: any, cotizacion: any){
    this.wiseService.getRequerimientosDeTransferencia(cuentaDestino, cotizacion).subscribe({
      next: (response: any) => {
        console.log(response);
        this.crearTransferencia(cuentaDestino, cotizacion);
      },
      error: (error) => console.error(error)
    });
  }

  crearTransferencia(cuentaDestino: any, cotizacion: any){
    this.wiseService.crearTransferencia(cuentaDestino, cotizacion).subscribe({
      next: (response: any) => {
        console.log(response);
        //finalizamos la transferencia
        this.finalizarTransferencia(response);
      },
      error: (error) => console.error(error)
    });
  }

  finalizarTransferencia(transferencia: any){
    this.wiseService.finalizarTransferencia(transferencia).subscribe({
      next: (response: any) => {
        console.log(response);
      },
      error: (error) => console.error(error)
    });
  }

  /*  */

  consultarRequerimientosDestinatario(cotizacion: any){
    this.wiseService.getRequerimientosDeDestinatario(cotizacion).subscribe({
      next: (response: any) => {
        console.log(response)
      },
      error: (error) => console.error(error)
    });
  }

  crearD(){
    const destinatario = {
      usuario: 'José Pérez'
    }
    this.wiseService.crearDestinatario(destinatario).subscribe({
      next: (response: any) => {
        console.log(response);
      },
      error: (error) => console.error(error)
    });
  }

}
