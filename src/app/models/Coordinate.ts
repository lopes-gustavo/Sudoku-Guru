export class Coordinate {
  constructor(
    public readonly row: number,
    public readonly column: number,
  ) {}

  public static fromNumber(num): Coordinate {
    const row = Math.ceil(num / 3);
    const column = num % 3 || 3;
    return new Coordinate(row, column);
  }

  public toString() {
    return this.row + '-' + this.column;
  }
}
