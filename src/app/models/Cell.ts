import { numberIsValid } from '../constants';
import { Coordinate } from './Coordinate';

export class Cell {
  public readonly coordinate: Coordinate;
  public causedError = false;
  public isValid = true;
  public isSystemDefault = false;

  constructor(
    row: number,
    column: number,
    private _value?: number,
  ) {
    this.setValue(_value);
    this.coordinate = new Coordinate(row, column);
  }

  public get row() {
    return this.coordinate.row;
  }

  public get column() {
    return this.coordinate.column;
  }

  public get square() {
    const squareRow = Math.ceil(this.row / 3);
    const squareColumn = Math.ceil(this.column / 3);

    return new Coordinate(squareRow, squareColumn);
  }

  public get value(): number {
    return this._value;
  }

  public static fromSquareAndPosition(square: Coordinate, position: Coordinate) {
    const row = (square.row - 1) * 3 + position.row;
    const column = (square.column - 1) * 3 + position.column;
    return new Cell(row, column);
  }

  public setValue(value: number) {
    if (value !== null && !numberIsValid(value)) {
      return false;
    }

    this._value = value;
    return true;
  }

  public isSame(other: Cell) {
    return this.coordinate.toString() === other.coordinate.toString();
  }
}
