export class StringUtils {
  /* Verificamos la longitud del campo dado */
  static _length(
    value: any,
    max: number,
    min: number,
    return_string: boolean = true
  ) {
    if (!value) return undefined;
    if (value === undefined) return undefined;
    if (typeof value == "object")
      return value.length <= max && value.length >= min ? value : undefined;
    const value_ = value.toString();
    if (value_.length <= max && value_.length >= min)
      return return_string ? value_ : value;
    return undefined;
  }
}
