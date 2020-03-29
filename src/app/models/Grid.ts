import { Cell } from './Cell';
import { SUDOKU_NUMBERS } from '../constants';
import { Coordinate } from './Coordinate';


export class Grid {
  public readonly cells = new Map<string, Cell>();
  public readonly columns = new Map<number, Map<number, Cell>>();
  public readonly rows = new Map<number, Map<number, Cell>>();
  public readonly squares = new Map<string, Map<string, Cell>>();

  constructor() {
    this.initGrid();
  }

  public addCell(cellRow: number, cellColumn: number) {
    const cell = new Cell(cellRow, cellColumn);

    const key = cell.coordinate.toString();
    this.cells.set(key, cell);

    const column = this.columns.get(cellColumn) || new Map<number, Cell>();
    column.set(cellRow, cell);
    this.columns.set(cellColumn, column);

    const row = this.rows.get(cellRow) || new Map<number, Cell>();
    row.set(cellColumn, cell);
    this.rows.set(cellRow, row);

    const square = this.squares.get(cell.square.toString()) || new Map<string, Cell>();
    square.set(key, cell);
    this.squares.set(cell.square.toString(), square);
  }

  public getCell(row: number, column: number) {
    return this.cells.get(new Coordinate(row, column).toString());
  }

  public validateCell(cell: Cell, displayErrors = false) {
    const row = this.rows.get(cell.row);
    const column = this.columns.get(cell.column);
    const square = this.squares.get(cell.square.toString());

    this.cells.forEach(c => c.causedError = false);

    cell.isValid = true;
    [ row, column, square ].forEach(validatorMap => {
      validatorMap.forEach(compareCell => {
        if (compareCell !== cell && compareCell.value === cell.value) {
          cell.isValid = false;
          if (displayErrors) { compareCell.causedError = true; }
        }
      });
    });
  }

  public findPossibleValues(row: number, column: number): Cell[] {
    if (this.getCell(row, column).isSystemDefault) { return null; }

    return SUDOKU_NUMBERS.reduce((acc, num) => {
      const cell = new Cell(row, column, num);
      this.validateCell(cell);

      if (cell.isValid) { acc.push(cell); }
      return acc;
    }, []);
  }

  public coordinateIsFulfilled(row: number, column: number): boolean;
  public coordinateIsFulfilled(coordinate: Coordinate): boolean;
  public coordinateIsFulfilled(arg1: number | Coordinate, arg2?: number) {
    const coordinate = typeof arg1 === 'number' ? new Coordinate(arg1, arg2) : arg1;
    return !!this.cells.get(coordinate.toString()).value;
  }

  private initGrid() {
    SUDOKU_NUMBERS.forEach(row => SUDOKU_NUMBERS.forEach(column => this.addCell(row, column)));
  }
}
