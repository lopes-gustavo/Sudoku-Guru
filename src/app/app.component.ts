import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Grid } from './models/Grid';
import { Cell } from './models/Cell';
import { SUDOKU_NUMBERS } from './constants';
import { Coordinate } from './models/Coordinate';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit, AfterViewInit {
  readonly grid = new Grid();
  @ViewChild('log') log: ElementRef<HTMLTextAreaElement>;

  ngOnInit() {
    // https://www.websudoku.com/?level=3&set_id=3189607069
    const nums = [
      { row: 1, column: 5, value: 7 },
      { row: 1, column: 7, value: 1 },

      { row: 2, column: 1, value: 4 },
      { row: 2, column: 3, value: 6 },
      { row: 2, column: 4, value: 3 },
      { row: 2, column: 8, value: 7 },

      { row: 3, column: 2, value: 3 },
      { row: 3, column: 5, value: 6 },

      { row: 4, column: 1, value: 9 },
      { row: 4, column: 7, value: 2 },
      { row: 4, column: 9, value: 4 },

      { row: 5, column: 2, value: 7 },
      { row: 5, column: 4, value: 4 },
      { row: 5, column: 5, value: 3 },
      { row: 5, column: 6, value: 8 },
      { row: 5, column: 8, value: 5 },

      { row: 6, column: 1, value: 5 },
      { row: 6, column: 3, value: 4 },
      { row: 6, column: 9, value: 1 },

      { row: 7, column: 5, value: 4 },
      { row: 7, column: 8, value: 2 },

      { row: 8, column: 2, value: 2 },
      { row: 8, column: 6, value: 3 },
      { row: 8, column: 7, value: 5 },
      { row: 8, column: 9, value: 6 },

      { row: 9, column: 3, value: 7 },
      { row: 9, column: 5, value: 2 },
    ];

    for (const { row, column, value } of nums) {
      const cell = this.grid.getCell(row, column);
      cell.setValue(value);
      cell.isSystemDefault = true;
    }
  }

  ngAfterViewInit() {
    // this.solveAll();
  }

  public solveAll(delay = 0) {
    const tid = setInterval(() => {
      if (!this.fillNext()) { clearInterval(tid); }
    }, delay);
  }

  public fillNext() {
    for (const row of SUDOKU_NUMBERS) {
      for (const column of SUDOKU_NUMBERS) {
        const c = this.findCellValue(row, column);
        if (c) {
          const { cell, reason } = c;
          if (!cell) { return false; }
          this.grid.getCell(cell.row, cell.column).setValue(cell.value);
          const log = `[${ row }, ${ column }]: ${ cell.value } - ${ reason }`;
          this.log.nativeElement.value += log + '\n';
          return true;
        }
      }
    }
    return false;
  }

  public onCellValueChange(event, cell: Cell) {
    event.preventDefault();

    const key = event.key;
    const numKey = Number(key);
    const isDelKey = key === 'Delete';

    if (!(numKey !== undefined || isDelKey)) { return; }

    const setOk = cell.setValue(isDelKey ? null : numKey);
    if (!setOk) { return; }

    this.grid.validateCell(cell, true);
  }

  private findCellValue(rowNum: number, columnNum: number): { cell: Cell, reason: string } {
    if (this.grid.coordinateIsFulfilled(rowNum, columnNum)) { return null; }

    const possibleCells = this.grid.findPossibleValues(rowNum, columnNum);
    if (!possibleCells) { return null; }
    if (possibleCells.length === 1) {
      return { cell: possibleCells[0], reason: 'Only valid value in cell' };
    }

    let reason: string;
    let uniqueCell: Cell;
    possibleCells.some(possibleCell => {

      const cellIsValid = (compareCell: Cell) => {
        // Validate only empty squares and not itself
        const isSameCell = compareCell.isSame(possibleCell);
        const hasValue = this.grid.coordinateIsFulfilled(compareCell.coordinate);
        if (isSameCell || hasValue) { return false; }

        compareCell.setValue(possibleCell.value);
        this.grid.validateCell(compareCell);
        return compareCell.isValid;
      };

      const rulesToAnalyse = [
        { name: 'square', cellGenerator: position => Cell.fromSquareAndPosition(possibleCell.square, Coordinate.fromNumber(position)) },
        { name: 'column', cellGenerator: row => new Cell(row, possibleCell.column) },
        { name: 'row', cellGenerator: column => new Cell(possibleCell.row, column) },
      ];
      const ruleFoundFirstUnique = rulesToAnalyse.find(({ cellGenerator }) => {
        return !SUDOKU_NUMBERS.some(testNum => {
          const compareCell = cellGenerator(testNum);
          return cellIsValid(compareCell);
        });
      });
      if (!ruleFoundFirstUnique) { return false; }

      reason = `Only position available for the value on the ${ ruleFoundFirstUnique.name }`;
      uniqueCell = possibleCell;
      return true;

    });

    if (!(uniqueCell && reason)) { return null; }

    return { cell: uniqueCell, reason };

  }

}
