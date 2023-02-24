import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WiseService {
  private apiToken: string = '37c47667-5cc8-4801-87f3-baf4e118240c';
  private apiUrl: string = 'https://api.sandbox.transferwise.tech';
  //crear el perfil desde el api wise profile para obtener el profile id
  private profileIdP: number = 16709126;
  private profileIdB: number = 16709127;

  constructor(private http: HttpClient) { }

  getCuentaOrigen() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`
    });
    return this.http.get(`${this.apiUrl}/v1/me`, { headers: headers });
  }

  crearCotizacion() {
    /* Consulte más arriba para obtener ayuda sobre cómo elegir el correcto para mostrar. */
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`
    });
    const params = JSON.stringify({
      "sourceCurrency": "USD",
      "targetCurrency": "USD",
      "sourceAmount": 10,
      "targetAmount": null,
      "payOut": 'BALANCE',
      "preferredPayIn": null
    });
    return this.http.post(`${this.apiUrl}/v3/profiles/${this.profileIdB}/quotes`, params, { headers: headers });
  }

  getRequerimientosDeDestinatario(cotizacion: any){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`
    });
    return this.http.get(`${this.apiUrl}/v1/quotes/${cotizacion.id}/account-requirements`, { headers: headers });
  }

  // crea al destinatario (dependiendo de los requerimientos 'getRequerimientosDeDestinatario()')
  crearDestinatario(destinatario: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`,
    });

    /* por correo electrónico */

    // const params = JSON.stringify({
    //   "profile": this.profileIdB,
    //   "accountHolderName": destinatario.usuario,
    //   "currency": "USD",
    //   "type": "email",
    //   "details": {
    //       "email": destinatario.correo
    //    }
    // });

    const params = JSON.stringify({
      "currency": "USD",
      "type": "aba",
      "profile": this.profileIdB,
      "ownedByCustomer": false,
      "accountHolderName": destinatario.usuario,
      "details": {
          "legalType": "PRIVATE",
          "abartn": "021000021",
          "accountNumber": "1234567890",
          "accountType": "SAVINGS",
          "address": {
            "address.country": "NI",
            "address.city": "Managua",
            "address.firstLine": "Managua, Nicaragua",
            "address.postCode": "10000"
          }
        }
    });

    return this.http.post(`${this.apiUrl}/v1/accounts`, params, { headers: headers });
  }

  getDestinatarios() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`
    });
    return this.http.get(`${this.apiUrl}/v1/accounts?profile=${this.profileIdB}&currency=USD`, { headers: headers });
  }

  actualizarCotizacion(cuentaDestino: any, cotizacion: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/merge-patch+json',
      'Authorization': `Bearer ${this.apiToken}`
    });
    const params = JSON.stringify({
      "targetAccount": cuentaDestino.id,
      "payOut": "BALANCE"
    });

    return this.http.patch(`${this.apiUrl}/v3/profiles/${this.profileIdB}/quotes/${cotizacion.id}`, params, { headers: headers });

  }

  getRequerimientosDeTransferencia(cuentaDestino: any, cotizacion: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`
    });
    const params = JSON.stringify({
      "targetAccount": cuentaDestino.id,
      "quoteUuid": cotizacion.id,
      "details": {
        "reference": "t-bee-fans",
        "sourceOfFunds": "verification.source.of.funds.other",
        "sourceOfFundsOther": "Trust funds"
      },
      "customerTransactionId": "6D9159CF-FA59-44C3-87A2-4506CE9C1EF9" //id generado por nosotros con el mismo formato
    });
    return this.http.post(`${this.apiUrl}/v1/transfer-requirements`, params, { headers: headers });
  }

  crearTransferencia(cuentaDestino: any, cotizacion: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`
    });
    const params = JSON.stringify({
      "targetAccount": cuentaDestino.id,
      "quoteUuid": cotizacion.id,
      "customerTransactionId": "6D9159CF-FA59-44C3-87A2-4506CE9C1EF9", //id generado por nosotros con el mismo formato
      "details": {
        "reference": "t-bee-fans",
        "transferPurpose": "verification.transfers.purpose.pay.bills",
        "transferPurposeSubTransferPurpose": "verification.sub.transfers.purpose.pay.interpretation.service",
        "sourceOfFunds": "verification.source.of.funds.other"
      }
    });
    return this.http.post(`${this.apiUrl}/v1/transfers`, params, { headers: headers });
  }

  finalizarTransferencia(transferencia: any) {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`
    });
    const params = JSON.stringify({
      "type": "BALANCE"
    });
    return this.http.post(`${this.apiUrl}/v3/profiles/${this.profileIdB}/transfers/${transferencia.id}/payments`, params, { headers: headers });
  }
}
