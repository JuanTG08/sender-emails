export class DateUtils {
  static formatearFechaHora(fecha: Date) {
    const opciones: any = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    const fechaFormateada = new Date(fecha).toLocaleString("es-ES", opciones);
    return fechaFormateada;
  }
}
