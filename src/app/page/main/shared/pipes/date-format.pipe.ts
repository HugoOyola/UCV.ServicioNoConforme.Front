import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) return '';

    try {
      let fechaObj: Date;
      const fechaLimpia = value.trim();

      // Caso 1: Formato ISO desde la BD (2025-06-02 09:40:38.427 o 2025-05-31 00:00:00.000)
      if (fechaLimpia.includes('-') && (fechaLimpia.includes(':') || fechaLimpia.includes('T'))) {
        // Para fechas con formato completo de SQL Server: 2025-06-02 09:40:38.427
        if (fechaLimpia.includes(' ') && fechaLimpia.includes(':')) {
          const [fechaParte] = fechaLimpia.split(' ');
          const [año, mes, dia] = fechaParte.split('-').map(Number);
          fechaObj = new Date(año, mes - 1, dia);
        }
        // Para fechas ISO con T
        else if (fechaLimpia.includes('T')) {
          const [fechaParte] = fechaLimpia.split('T');
          const [año, mes, dia] = fechaParte.split('-').map(Number);
          fechaObj = new Date(año, mes - 1, dia);
        }
        // Para fechas solo con fecha (2025-05-31)
        else {
          const [año, mes, dia] = fechaLimpia.split('-').map(Number);
          fechaObj = new Date(año, mes - 1, dia);
        }
      }
      // Caso 2: Formato con barras (DD/MM/YYYY, MM/DD/YYYY, o variantes)
      else if (fechaLimpia.includes('/')) {
        const soloFecha = fechaLimpia.split(' ')[0];
        const partes = soloFecha.split('/').map(Number);

        if (partes.length === 3) {
          let dia: number, mes: number, año: number;

          // Si el primer número es mayor a 12, es DD/MM/YYYY
          if (partes[0] > 12) {
            dia = partes[0];
            mes = partes[1];
            año = partes[2];
          }
          // Si el segundo número es mayor a 12, es MM/DD/YYYY
          else if (partes[1] > 12) {
            mes = partes[0];
            dia = partes[1];
            año = partes[2];
          }
          // Si ambos son <= 12, asumir formato DD/MM/YYYY (español)
          else {
            dia = partes[0];
            mes = partes[1];
            año = partes[2];

            // Si el año es de 2 dígitos, convertir a 4 dígitos
            if (año < 100) {
              año = año + (año < 50 ? 2000 : 1900);
            }
          }

          fechaObj = new Date(año, mes - 1, dia);
        } else {
          fechaObj = new Date(fechaLimpia);
        }
      }
      // Caso 3: Otros formatos
      else {
        fechaObj = new Date(fechaLimpia);
      }

      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        console.warn('Fecha inválida detectada en pipe:', value);
        return this.extraerFechaComoTexto(fechaLimpia);
      }

      // Formatear como DD/MM/YYYY
      const dia = fechaObj.getDate().toString().padStart(2, '0');
      const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
      const año = fechaObj.getFullYear();

      return `${dia}/${mes}/${año}`;

    } catch (error) {
      console.warn('Error al formatear fecha en pipe:', value, error);
      return this.extraerFechaComoTexto(value);
    }
  }

  /**
   * Método auxiliar para extraer fecha como texto cuando falla el parseo
   */
  private extraerFechaComoTexto(fecha: string): string {
    try {
      if (fecha.includes(' ')) {
        return fecha.split(' ')[0];
      }
      return fecha;
    } catch {
      return fecha;
    }
  }
}